import { getSupabase } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { feedbackSchema } from '../validators/feedbackValidator.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const validated = feedbackSchema.parse(req.body);
    const supabase = getSupabase();

    const { data: complaint, error: compErr } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .single();

    if (compErr || !complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    if (complaint.student_id !== req.user.id) {
      return sendError(res, 'Only the student who filed this complaint can submit feedback', 403);
    }

    if (!['Resolved', 'Verified/Closed'].includes(complaint.status)) {
      return sendError(res, 'Feedback can only be submitted for resolved complaints', 400);
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('id')
      .eq('complaint_id', complaintId)
      .single();

    if (existingFeedback) {
      return sendError(res, 'Feedback has already been submitted for this complaint', 400);
    }

    const { data: createdFeedback, error: fbErr } = await supabase
      .from('feedback')
      .insert({
        complaint_id: complaintId,
        student_id: req.user.id,
        rating: validated.rating,
        comments: validated.comments || '',
      })
      .select();

    if (fbErr) {
      return sendError(res, `Failed to submit feedback: ${fbErr.message}`, 500);
    }

    // Recalculate technician rating if technician was assigned
    if (complaint.assigned_technician_id) {
      const { data: techFeedbacks } = await supabase
        .from('feedback')
        .select('rating, complaint:complaints!inner(assigned_technician_id)')
        .eq('complaints.assigned_technician_id', complaint.assigned_technician_id);

      if (techFeedbacks && techFeedbacks.length > 0) {
        const sum = techFeedbacks.reduce((acc, f) => acc + (f.rating || 5), 0);
        const avg = Number((sum / techFeedbacks.length).toFixed(2));
        await supabase
          .from('technicians')
          .update({ rating_average: avg })
          .eq('id', complaint.assigned_technician_id);
      }

      // Notify technician
      const { data: tech } = await supabase
        .from('technicians')
        .select('user_id')
        .eq('id', complaint.assigned_technician_id)
        .single();

      if (tech) {
        await createNotification({
          userId: tech.user_id,
          title: `Student Feedback: ${validated.rating} Stars!`,
          message: `Feedback received for ticket ${complaint.complaint_code}: "${validated.comments || 'No comments'}"`,
          type: 'success',
          complaintId,
        });
      }
    }

    // Add complaint history entry
    await supabase.from('complaint_history').insert({
      complaint_id: complaintId,
      action: 'Feedback Submitted',
      previous_status: complaint.status,
      new_status: 'Verified/Closed',
      performed_by: req.user.id,
      performer_role: 'student',
      remarks: `Student rated ${validated.rating}/5 stars: "${validated.comments || ''}"`,
    });

    // Also auto-close ticket upon positive feedback
    await supabase.from('complaints').update({
      status: 'Verified/Closed',
      closed_at: new Date().toISOString(),
    }).eq('id', complaintId);

    await notifyAdmins({
      title: `Feedback on ${complaint.complaint_code}`,
      message: `Student left a ${validated.rating}-star review for "${complaint.title}".`,
      type: 'info',
      complaintId,
    });

    return sendSuccess(res, 'Feedback submitted successfully', createdFeedback);
  } catch (err) {
    next(err);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: feedbacks, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return sendError(res, 'Failed to fetch feedback records', 500);
    }

    return sendSuccess(res, 'Feedback list retrieved', feedbacks || []);
  } catch (err) {
    next(err);
  }
};

