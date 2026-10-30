import { getSupabase } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getTechnicians = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: technicians, error } = await supabase
      .from('technicians')
      .select('*')
      .order('active_tasks_count', { ascending: true });

    if (error) {
      return sendError(res, `Failed to fetch technicians: ${error.message}`, 500);
    }

    const { data: users } = await supabase.from('users').select('id, name, email, phone');
    const userMap = new Map((users || []).map((u) => [u.id, u]));

    const enriched = (technicians || []).map((t) => ({
      ...t,
      user: userMap.get(t.user_id) || null,
    }));

    return sendSuccess(res, 'Technicians retrieved successfully', enriched);
  } catch (err) {
    next(err);
  }
};

export const updateTechnicianStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const supabase = getSupabase();

    const { data: updated, error } = await supabase
      .from('technicians')
      .update({ is_available: Boolean(isAvailable) })
      .eq('id', id);

    if (error) {
      return sendError(res, 'Failed to update technician availability', 500);
    }

    return sendSuccess(res, 'Technician status updated', updated);
  } catch (err) {
    next(err);
  }
};

export const getTechnicianStats = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    let technicianId = req.params.id;

    if (req.user.role === 'technician') {
      const { data: tech } = await supabase
        .from('technicians')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      if (!tech) return sendError(res, 'Technician profile not found', 404);
      technicianId = tech.id;
    }

    const { data: tasks } = await supabase
      .from('complaints')
      .select('*')
      .eq('assigned_technician_id', technicianId);

    const taskList = tasks || [];
    const assigned = taskList.filter((t) => t.status === 'Assigned').length;
    const inProgress = taskList.filter((t) => t.status === 'In Progress').length;
    const resolved = taskList.filter((t) => ['Resolved', 'Verified/Closed'].includes(t.status)).length;

    return sendSuccess(res, 'Technician stats retrieved', {
      totalAssigned: taskList.length,
      assigned,
      inProgress,
      resolved,
      activeTasks: assigned + inProgress,
    });
  } catch (err) {
    next(err);
  }
};

