import api from './api.js';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  registerStudent: async (data) => {
    return api.post('/auth/register/student', data);
  },
  registerWarden: async (data) => {
    return api.post('/auth/register/warden', data);
  },
  registerTechnician: async (data) => {
    return api.post('/auth/register/technician', data);
  },
  getProfile: async () => {
    return api.get('/auth/profile');
  },
  updateProfile: async (data) => {
    return api.put('/auth/profile', data);
  },
  getRooms: async () => {
    return api.get('/auth/rooms');
  },
  getPendingStaff: async () => {
    return api.get('/auth/pending-staff');
  },
  approveStaff: async (id) => {
    return api.put(`/auth/staff/${id}/approve`);
  },
};
