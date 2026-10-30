import api from './api.js';

export const feedbackService = {
  submitFeedback: async (complaintId, data) => {
    return api.post(`/feedback/${complaintId}`, data);
  },
  getFeedback: async () => {
    return api.get('/feedback');
  },
};

