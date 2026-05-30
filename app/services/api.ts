import axios from 'axios';

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://api.thefintrade.com';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., clear token and redirect to login if needed)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Do not force redirect here to preserve UI state without breaking React Router heavily,
      // but apps generally dispatch an event or use context.
    }
    return Promise.reject(error);
  }
);

export default api;
