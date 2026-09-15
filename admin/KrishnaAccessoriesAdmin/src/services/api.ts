import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5070/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('krishna_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('krishna_admin_token');
      localStorage.removeItem('krishna_admin_user');
      window.dispatchEvent(new Event('auth_change'));
    }
    return Promise.reject(error);
  }
);

export default api;
