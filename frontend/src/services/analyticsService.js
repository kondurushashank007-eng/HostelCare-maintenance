import api from './api.js';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    return api.get('/analytics/dashboard');
  },
  askAssistant: async (question) => {
    return api.post('/analytics/assistant', { question });
  },
};

