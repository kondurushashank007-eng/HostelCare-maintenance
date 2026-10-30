import { getSupabase } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { askMaintenanceAssistant } from '../services/geminiService.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const supabase = getSupabase();

    // 1. Fetch complaints
    const { data: complaints, error: cErr } = await supabase
      .from('complaints')
      .select('*');

    if (cErr) {
      return sendError(res, `Failed to fetch analytics: ${cErr.message}`, 500);
    }

    const all = complaints || [];
    const total = all.length;

    // Status metrics
    const statusCounts = {
      total,
      submitted: all.filter((c) => c.status === 'Submitted').length,
      pending: all.filter((c) => ['Submitted', 'Pending'].includes(c.status)).length,
      assigned: all.filter((c) => c.status === 'Assigned').length,
      inProgress: all.filter((c) => c.status === 'In Progress').length,
      resolved: all.filter((c) => ['Resolved', 'Verified/Closed'].includes(c.status)).length,
      escalated: all.filter((c) => c.status === 'Escalated' || c.is_escalated).length,
      reopened: all.filter((c) => c.status === 'Reopened').length,
    };

    // Category breakdown
    const categoryCounts = {};
    for (const c of all) {
      const cat = c.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Priority breakdown
    const priorityCounts = {
      Low: all.filter((c) => c.priority === 'Low').length,
      Medium: all.filter((c) => c.priority === 'Medium').length,
      High: all.filter((c) => c.priority === 'High').length,
      Urgent: all.filter((c) => c.priority === 'Urgent').length,
    };

    // Block breakdown
    const { data: rooms } = await supabase.from('hostel_rooms').select('id, block, room_number');
    const roomBlockMap = new Map((rooms || []).map((r) => [r.id, r.block]));

    const blockCounts = { A: 0, B: 0, C: 0, D: 0, Other: 0 };
    for (const c of all) {
      const blk = roomBlockMap.get(c.room_id) || 'Other';
      if (blockCounts[blk] !== undefined) {
        blockCounts[blk]++;
      } else {
        blockCounts.Other++;
      }
    }

    // Average resolution time (hours)
    const resolvedComplaints = all.filter((c) => c.resolved_at && c.created_at);
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((acc, c) => {
        const diff = (new Date(c.resolved_at) - new Date(c.created_at)) / (1000 * 60 * 60);
        return acc + Math.max(diff, 0.5);
      }, 0);
      avgResolutionHours = Number((totalHours / resolvedComplaints.length).toFixed(1));
    }

    // Technician performance leaderboard
    const { data: technicians } = await supabase.from('technicians').select('*');
    const { data: users } = await supabase.from('users').select('id, name');
    const userMap = new Map((users || []).map((u) => [u.id, u.name]));

    const technicianLeaderboard = (technicians || []).map((t) => {
      const techTasks = all.filter((c) => c.assigned_technician_id === t.id);
      const techResolved = techTasks.filter((c) => ['Resolved', 'Verified/Closed'].includes(c.status)).length;
      return {
        id: t.id,
        name: userMap.get(t.user_id) || 'Technician',
        specialization: t.specialization,
        activeTasks: t.active_tasks_count || 0,
        resolvedTasks: techResolved,
        rating: t.rating_average || 5.0,
      };
    }).sort((a, b) => b.resolvedTasks - a.resolvedTasks);

    return sendSuccess(res, 'Dashboard analytics retrieved', {
      statusCounts,
      categoryBreakdown,
      priorityCounts,
      blockCounts,
      avgResolutionHours,
      technicianLeaderboard,
    });
  } catch (err) {
    next(err);
  }
};

export const askAiAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) {
      return sendError(res, 'Question is required', 400);
    }

    const supabase = getSupabase();
    const { data: complaints } = await supabase.from('complaints').select('*');
    const all = complaints || [];

    // Construct live context
    const categoryCounts = {};
    for (const c of all) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const { data: rooms } = await supabase.from('hostel_rooms').select('id, block');
    const roomBlockMap = new Map((rooms || []).map((r) => [r.id, r.block]));
    const blockDistribution = {};
    for (const c of all) {
      const blk = roomBlockMap.get(c.room_id) || 'Unknown';
      blockDistribution[blk] = (blockDistribution[blk] || 0) + 1;
    }

    const liveContext = {
      totalComplaints: all.length,
      pending: all.filter((c) => ['Submitted', 'Pending'].includes(c.status)).length,
      inProgress: all.filter((c) => c.status === 'In Progress').length,
      resolved: all.filter((c) => ['Resolved', 'Verified/Closed'].includes(c.status)).length,
      escalated: all.filter((c) => c.status === 'Escalated' || c.is_escalated).length,
      topCategories,
      blockDistribution,
    };

    const answer = await askMaintenanceAssistant(question, liveContext);

    return sendSuccess(res, 'AI assistant answered query', {
      question,
      answer,
    });
  } catch (err) {
    next(err);
  }
};

