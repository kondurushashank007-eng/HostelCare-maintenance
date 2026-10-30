import { getSupabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  complaintId = null,
}) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      complaint_id: complaintId,
      is_read: false,
    });

    if (error) {
      logger.warn('[Notification] Failed to create notification:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    logger.error('[Notification] Error creating notification:', err.message);
    return null;
  }
};

export const notifyAdmins = async ({ title, message, type = 'info', complaintId = null }) => {
  try {
    const supabase = getSupabase();
    const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title,
          message,
          type,
          complaintId,
        });
      }
    }
  } catch (err) {
    logger.error('[Notification] Failed to notify admins:', err.message);
  }
};

