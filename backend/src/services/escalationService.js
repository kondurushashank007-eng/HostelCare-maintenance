import { getSupabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { notifyAdmins, createNotification } from './notificationService.js';

const ESCALATION_THRESHOLDS_HOURS = {
  Urgent: 6,
  High: 24,
  Medium: 48,
  Low: 72,
};

export const checkAndEscalateComplaints = async () => {
  try {
    const supabase = getSupabase();
    // Fetch active complaints not resolved or closed
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*');

    if (error || !complaints) return { checked: 0, escalatedCount: 0 };

    const now = new Date();
    let escalatedCount = 0;

    for (const item of complaints) {
      if (['Resolved', 'Verified/Closed', 'Escalated'].includes(item.status)) continue;
      if (item.is_escalated) continue;

      const priority = item.priority || 'Medium';
      const thresholdHours = ESCALATION_THRESHOLDS_HOURS[priority] || 48;
      const createdAt = new Date(item.created_at);
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

      if (hoursDiff >= thresholdHours) {
        const reason = `Automated Escalation: Ticket ${item.complaint_code} exceeded ${thresholdHours}h resolution threshold for ${priority} priority.`;

        // Update complaint
        await supabase
          .from('complaints')
          .update({
            is_escalated: true,
            status: 'Escalated',
            escalation_reason: reason,
            escalated_at: now.toISOString(),
          })
          .eq('id', item.id);

        // Add history
        await supabase.from('complaint_history').insert({
          complaint_id: item.id,
          action: 'Escalated',
          previous_status: item.status,
          new_status: 'Escalated',
          performer_role: 'system',
          remarks: reason,
        });

        // Notify Student
        await createNotification({
          userId: item.student_id,
          title: `Complaint Escalated: ${item.complaint_code}`,
          message: `Your complaint has been automatically escalated to Hostel Warden for expedited resolution.`,
          type: 'escalation',
          complaintId: item.id,
        });

        // Notify Admins
        await notifyAdmins({
          title: `Overdue Ticket Escalated: ${item.complaint_code}`,
          message: `${item.title} (${item.category}, Priority: ${priority}) is overdue. Immediate warden action needed.`,
          type: 'escalation',
          complaintId: item.id,
        });

        escalatedCount++;
      }
    }

    if (escalatedCount > 0) {
      logger.info(`[Escalation Service] Auto-escalated ${escalatedCount} overdue complaint(s).`);
    }

    return { checked: complaints.length, escalatedCount };
  } catch (err) {
    logger.error('[Escalation Service] Failed to run escalation check:', err.message);
    return { error: err.message };
  }
};

