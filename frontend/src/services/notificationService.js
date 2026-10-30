import api from './api.js';

export const notificationService = {
  getNotifications: async () => {
    return api.get('/notifications');
  },
  markAsRead: async (id = 'all') => {
    return api.patch(`/notifications/${id}/read`);
  },
};

