import api from './api.js';

export const technicianService = {
  getTechnicians: async () => {
    return api.get('/technicians');
  },
  updateAvailability: async (id, isAvailable) => {
    return api.patch(`/technicians/${id}/availability`, { isAvailable });
  },
  getStats: async (id = null) => {
    return id ? api.get(`/technicians/${id}/stats`) : api.get('/technicians/stats');
  },
};

