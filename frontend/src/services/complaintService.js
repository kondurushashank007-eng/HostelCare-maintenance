import api from './api.js';

export const complaintService = {
  getComplaints: async (params = {}) => {
    return api.get('/complaints', { params });
  },
  getComplaintById: async (id) => {
    return api.get(`/complaints/${id}`);
  },
  createComplaint: async (complaintData) => {
    return api.post('/complaints', complaintData);
  },
  updateStatus: async (id, statusData) => {
    return api.patch(`/complaints/${id}/status`, statusData);
  },
  assignTechnician: async (id, assignData) => {
    return api.patch(`/complaints/${id}/assign`, assignData);
  },
  updatePriority: async (id, priorityData) => {
    return api.patch(`/complaints/${id}/priority`, priorityData);
  },
  reopenComplaint: async (id, reasonData) => {
    return api.post(`/complaints/${id}/reopen`, reasonData);
  },
  analyzeWithAi: async (data) => {
    return api.post('/complaints/ai-analyze', data);
  },
  checkEscalations: async () => {
    return api.post('/complaints/check-escalations');
  },
};

