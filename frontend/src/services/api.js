import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostelcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 & error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // If unauthorized or expired token, clear storage and redirect
        localStorage.removeItem('hostelcare_token');
        localStorage.removeItem('hostelcare_user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      const message = error.response.data?.message || 'Something went wrong';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Network error. Check backend server connection.'));
  }
);

export default api;

