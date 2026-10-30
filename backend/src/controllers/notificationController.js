import { getSupabase } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const supabase = getSupabase();
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return sendError(res, 'Failed to fetch notifications', 500);
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

    return sendSuccess(res, 'Notifications retrieved', {
      notifications: notifications || [],
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();

    if (id === 'all') {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.user.id);
    } else {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', req.user.id);
    }

    return sendSuccess(res, 'Notifications marked as read');
  } catch (err) {
    next(err);
  }
};

