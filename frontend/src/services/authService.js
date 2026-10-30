import api from './api.js';

export const authService = {
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return api.post('/auth/register', userData);
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
};

