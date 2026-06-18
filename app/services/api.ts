import axios from 'axios';

// Base API configuration
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_URL = import.meta.env.VITE_API_URL || 
  (isLocalhost ? 'http://localhost:8000' : 'https://api.thefintrade.com');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token





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
      // Skip auto-redirect for auth endpoints — let the UI show the error
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/verify-otp') ||
        url.includes('/auth/google') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password');

      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
