import { getSupabase } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { generateComplaintCode } from '../utils/idGenerator.js';
import {
  createComplaintSchema,
  updateStatusSchema,
  assignTechnicianSchema,
  updatePrioritySchema,
  reopenComplaintSchema,
} from '../validators/complaintValidator.js';
import {
  analyzeComplaint,
  checkDuplicateComplaint,
} from '../services/geminiService.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';
import { checkAndEscalateComplaints } from '../services/escalationService.js';

export const createComplaint = async (req, res, next) => {
  try {
    const validated = createComplaintSchema.parse(req.body);
    const supabase = getSupabase();

    // Determine room
    let roomId = validated.roomId || req.user.roomId;
    if (!roomId) {
      const { data: userRec } = await supabase
        .from('users')
        .select('room_id')
        .eq('id', req.user.id)
        .single();
      roomId = userRec?.room_id || null;
    }

    // Run AI analysis (Gemini with rule-based fallback)
    const aiAnalysis = await analyzeComplaint(
      validated.title,
      validated.description,
      validated.category
    );

    // Check potential duplicates
    const { data: recentComplaints } = await supabase
      .from('complaints')
      .select('id, complaint_code, title, description, category, room_id, status')
      .order('created_at', { ascending: false })
      .limit(50);

    const duplicateCheck = checkDuplicateComplaint(
      {
        roomId,
        category: validated.category,
        title: validated.title,
        description: validated.description,
      },
      recentComplaints || []
    );

    const fullAiData = {
      ...aiAnalysis,
      duplicate_detection: duplicateCheck,
    };

    const complaintCode = generateComplaintCode();

    const newComplaint = {
      complaint_code: complaintCode,
      student_id: req.user.id,
      room_id: roomId,
      title: validated.title.trim(),
      description: validated.description.trim(),
      category: validated.category,
      priority: validated.priority || aiAnalysis.priority_suggested || 'Medium',
      status: 'Submitted',
      images: validated.images || [],
      resolution_images: [],
      ai_analysis: fullAiData,
      is_escalated: false,
    };

    const { data: created, error } = await supabase
      .from('complaints')
      .insert(newComplaint)
      .select();

    if (error) {
      return sendError(res, `Failed to lodge complaint: ${error.message}`, 500);
    }

    const complaintRecord = Array.isArray(created) ? created[0] : created;

    // Add initial history entry
    await supabase.from('complaint_history').insert({
      complaint_id: complaintRecord.id,
      action: 'Submitted',
      previous_status: null,
      new_status: 'Submitted',
      performed_by: req.user.id,
      performer_role: 'student',
      remarks: 'Complaint registered by student.',
    });

    // Notify student
    await createNotification({
      userId: req.user.id,
      title: `Complaint Submitted: ${complaintCode}`,
      message: `Your ticket for "${validated.title}" has been registered. AI priority: ${newComplaint.priority}.`,
      type: 'info',
      complaintId: complaintRecord.id,
    });

    // Notify admins
    await notifyAdmins({
      title: `New Complaint: ${complaintCode}`,
      message: `Student lodged "${validated.title}" (${validated.category}). Priority: ${newComplaint.priority}.`,
      type: newComplaint.priority === 'Urgent' ? 'alert' : 'info',
      complaintId: complaintRecord.id,
    });

    return sendSuccess(res, 'Complaint lodged successfully', complaintRecord, 201);
  } catch (err) {
    next(err);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { role, id: userId } = req.user;
    const { status, category, priority, block, search, page = 1, limit = 50 } = req.query;

    let query = supabase.from('complaints').select('*');

    // Role-based restrictions
    if (role === 'student') {
      query = query.eq('student_id', userId);
    } else if (role === 'technician') {
      // Find technician record for this user
      const { data: tech } = await supabase
        .from('technicians')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!tech) {
        return sendSuccess(res, 'Complaints retrieved', []);
      }
      query = query.eq('assigned_technician_id', tech.id);
    }

    // Filters
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    const { data: rawComplaints, error } = await query;
    if (error) {
      return sendError(res, `Failed to fetch complaints: ${error.message}`, 500);
    }

    let complaints = rawComplaints || [];

    // Search filter in memory/client (title, code, description)
    if (search) {
      const q = search.toLowerCase();
      complaints = complaints.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.complaint_code?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    // Enrich complaints with room, student, and technician details
    const { data: allRooms } = await supabase.from('hostel_rooms').select('*');
    const { data: allUsers } = await supabase.from('users').select('id, name, email, phone');
    const { data: allTechs } = await supabase.from('technicians').select('id, user_id, specialization');

    const roomMap = new Map((allRooms || []).map((r) => [r.id, r]));
    const userMap = new Map((allUsers || []).map((u) => [u.id, u]));
    const techMap = new Map((allTechs || []).map((t) => [t.id, t]));

    let enriched = complaints.map((c) => {
      const room = c.room_id ? roomMap.get(c.room_id) : null;
      const student = c.student_id ? userMap.get(c.student_id) : null;
      const tech = c.assigned_technician_id ? techMap.get(c.assigned_technician_id) : null;
      const techUser = tech ? userMap.get(tech.user_id) : null;

      return {
        ...c,
        room,
        student,
        technician: tech ? { ...tech, user: techUser } : null,
      };
    });

    // Block filter
    if (block) {
      enriched = enriched.filter((c) => c.room && c.room.block === block);
    }

    return sendSuccess(res, 'Complaints retrieved successfully', enriched);
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Authorization checks
    if (req.user.role === 'student' && complaint.student_id !== req.user.id) {
      return sendError(res, 'Access denied. You can only view your own complaints.', 403);
    }

    if (req.user.role === 'technician') {
      const { data: tech } = await supabase
        .from('technicians')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      if (!tech || complaint.assigned_technician_id !== tech.id) {
        return sendError(res, 'Access denied. You can only view complaints assigned to you.', 403);
      }
    }

    // Fetch related records
    let room = null;
    if (complaint.room_id) {
      const { data: r } = await supabase.from('hostel_rooms').select('*').eq('id', complaint.room_id).single();
      room = r || null;
    }

    let student = null;
    if (complaint.student_id) {
      const { data: s } = await supabase.from('users').select('id, name, email, phone').eq('id', complaint.student_id).single();
      student = s || null;
    }

    let technician = null;
    if (complaint.assigned_technician_id) {
      const { data: t } = await supabase.from('technicians').select('*').eq('id', complaint.assigned_technician_id).single();
      if (t) {
        const { data: tu } = await supabase.from('users').select('name, email, phone').eq('id', t.user_id).single();
        technician = { ...t, user: tu };
      }
    }

    // Fetch complaint history
    const { data: rawHistory } = await supabase
      .from('complaint_history')
      .select('*')
      .eq('complaint_id', id)
      .order('created_at', { ascending: true });

    // Fetch feedback if any
    const { data: feedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('complaint_id', id)
      .single();

    const historyWithUsers = await Promise.all(
      (rawHistory || []).map(async (h) => {
        let performer = null;
        if (h.performed_by) {
          const { data: u } = await supabase.from('users').select('name, role').eq('id', h.performed_by).single();
          performer = u || null;
        }
        return { ...h, performer };
      })
    );

    return sendSuccess(res, 'Complaint details retrieved', {
      ...complaint,
      room,
      student,
      technician,
      history: historyWithUsers,
      feedback: feedback || null,
    });
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateStatusSchema.parse(req.body);
    const supabase = getSupabase();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Technicians can only update their assigned tickets
    if (req.user.role === 'technician') {
      const { data: tech } = await supabase
        .from('technicians')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      if (!tech || complaint.assigned_technician_id !== tech.id) {
        return sendError(res, 'Not authorized to update this complaint', 403);
      }
    }

    const updates = {
      status: validated.status,
    };

    if (validated.status === 'Resolved') {
      updates.resolved_at = new Date().toISOString();
      if (validated.resolutionImages && validated.resolutionImages.length > 0) {
        updates.resolution_images = validated.resolutionImages;
      }
    } else if (validated.status === 'Verified/Closed') {
      updates.closed_at = new Date().toISOString();
    }

    await supabase.from('complaints').update(updates).eq('id', id);

    // Record history
    await supabase.from('complaint_history').insert({
      complaint_id: id,
      action: `Status Changed to ${validated.status}`,
      previous_status: complaint.status,
      new_status: validated.status,
      performed_by: req.user.id,
      performer_role: req.user.role,
      remarks: validated.remarks || `Status updated from ${complaint.status} to ${validated.status}.`,
    });

    // Notify Student
    await createNotification({
      userId: complaint.student_id,
      title: `Complaint Status: ${validated.status}`,
      message: `Your ticket ${complaint.complaint_code} is now marked as "${validated.status}".`,
      type: validated.status === 'Resolved' ? 'success' : 'info',
      complaintId: id,
    });

    // Notify Admins
    await notifyAdmins({
      title: `Status Updated: ${complaint.complaint_code}`,
      message: `Status moved to "${validated.status}" by ${req.user.name} (${req.user.role}).`,
      type: 'info',
      complaintId: id,
    });

    return sendSuccess(res, 'Complaint status updated successfully', {
      id,
      status: validated.status,
    });
  } catch (err) {
    next(err);
  }
};

export const assignTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = assignTechnicianSchema.parse(req.body);
    const supabase = getSupabase();

    const { data: complaint, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Verify technician exists
    const { data: tech } = await supabase
      .from('technicians')
      .select('*, user:users(id, name, phone)')
      .eq('id', validated.technicianId)
      .single();

    if (!tech) {
      return sendError(res, 'Technician not found', 404);
    }

    const updates = {
      assigned_technician_id: validated.technicianId,
      status: 'Assigned',
    };
    if (validated.priority) {
      updates.priority = validated.priority;
    }

    await supabase.from('complaints').update(updates).eq('id', id);

    // Increment technician workload count
    await supabase
      .from('technicians')
      .update({
        active_tasks_count: (tech.active_tasks_count || 0) + 1,
      })
      .eq('id', validated.technicianId);

    // Add history record
    await supabase.from('complaint_history').insert({
      complaint_id: id,
      action: 'Technician Assigned',
      previous_status: complaint.status,
      new_status: 'Assigned',
      performed_by: req.user.id,
      performer_role: 'admin',
      remarks: validated.remarks || `Assigned to technician (${tech.specialization}). Priority set to ${updates.priority || complaint.priority}.`,
    });

    // Notify Technician
    await createNotification({
      userId: tech.user_id,
      title: `New Task Assigned: ${complaint.complaint_code}`,
      message: `You have been assigned complaint "${complaint.title}". Priority: ${updates.priority || complaint.priority}.`,
      type: 'info',
      complaintId: id,
    });

    // Notify Student
    await createNotification({
      userId: complaint.student_id,
      title: `Technician Assigned to Your Complaint`,
      message: `A technician has been assigned to ticket ${complaint.complaint_code}. Work will commence shortly.`,
      type: 'info',
      complaintId: id,
    });

    return sendSuccess(res, 'Technician assigned successfully', {
      id,
      assignedTechnicianId: validated.technicianId,
      status: 'Assigned',
    });
  } catch (err) {
    next(err);
  }
};

export const updatePriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updatePrioritySchema.parse(req.body);
    const supabase = getSupabase();

    const { data: complaint } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (!complaint) return sendError(res, 'Complaint not found', 404);

    await supabase.from('complaints').update({ priority: validated.priority }).eq('id', id);

    await supabase.from('complaint_history').insert({
      complaint_id: id,
      action: `Priority Changed to ${validated.priority}`,
      previous_status: complaint.status,
      new_status: complaint.status,
      performed_by: req.user.id,
      performer_role: 'admin',
      remarks: validated.remarks || `Priority modified by admin to ${validated.priority}.`,
    });

    return sendSuccess(res, 'Priority updated successfully', { priority: validated.priority });
  } catch (err) {
    next(err);
  }
};

export const reopenComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = reopenComplaintSchema.parse(req.body);
    const supabase = getSupabase();

    const { data: complaint } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .single();

    if (!complaint) return sendError(res, 'Complaint not found', 404);

    if (complaint.student_id !== req.user.id) {
      return sendError(res, 'Only the student who lodged the complaint can reopen it', 403);
    }

    await supabase.from('complaints').update({
      status: 'Reopened',
    }).eq('id', id);

    await supabase.from('complaint_history').insert({
      complaint_id: id,
      action: 'Reopened',
      previous_status: complaint.status,
      new_status: 'Reopened',
      performed_by: req.user.id,
      performer_role: 'student',
      remarks: `Reopened by student: "${validated.reason}"`,
    });

    await notifyAdmins({
      title: `Complaint Reopened: ${complaint.complaint_code}`,
      message: `Student reopened ticket "${complaint.title}". Reason: ${validated.reason}`,
      type: 'warning',
      complaintId: id,
    });

    return sendSuccess(res, 'Complaint reopened successfully', { id, status: 'Reopened' });
  } catch (err) {
    next(err);
  }
};

export const runAiAnalysis = async (req, res, next) => {
  try {
    const { title, description, category, roomId } = req.body;
    if (!title || !description) {
      return sendError(res, 'Title and description are required for AI analysis', 400);
    }

    const supabase = getSupabase();
    const analysis = await analyzeComplaint(title, description, category || '');

    // Duplicate detection
    const { data: recent } = await supabase
      .from('complaints')
      .select('id, complaint_code, title, description, category, room_id, status')
      .order('created_at', { ascending: false })
      .limit(30);

    const duplicates = checkDuplicateComplaint(
      { roomId, category: analysis.category_suggested, title, description },
      recent || []
    );

    return sendSuccess(res, 'AI analysis completed', {
      ...analysis,
      duplicate_detection: duplicates,
    });
  } catch (err) {
    next(err);
  }
};

export const triggerEscalation = async (req, res, next) => {
  try {
    const result = await checkAndEscalateComplaints();
    return sendSuccess(res, 'Escalation check completed', result);
  } catch (err) {
    next(err);
  }
};

