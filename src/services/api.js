// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codecollab-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers (auto-refresh)
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('codecollab-token', newToken);
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Handle different error status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('codecollab-token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          toast.error(data.error || 'Authentication failed');
          break;
          
        case 403:
          toast.error(data.error || 'Access denied');
          break;
          
        case 404:
          toast.error(data.error || 'Resource not found');
          break;
          
        case 429:
          toast.error(data.error || 'Too many requests. Please slow down.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.error || 'An unexpected error occurred');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/auth/preferences', preferences);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/auth/account', { data: { password } });
    return response.data;
  },

  // Verify token
  verifyToken: async (token) => {
    const response = await api.post('/auth/verify-token', { token });
    return response.data;
  },

  // Get user stats
  getStats: async () => {
    const response = await api.get('/auth/stats');
    return response.data;
  },
};

// Session API endpoints
export const sessionAPI = {
  // Create new session
  create: async (sessionData) => {
    const response = await api.post('/sessions/create', sessionData);
    return response.data;
  },

  // Join session by code
  join: async (sessionCode) => {
    const response = await api.post('/sessions/join', { sessionCode });
    return response.data;
  },

  // Get session by ID
  getById: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Get session by code
  getByCode: async (sessionCode) => {
    const response = await api.get(`/sessions/code/${sessionCode}`);
    return response.data;
  },

  // Get user's sessions
  getUserSessions: async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  // Get public sessions
  getPublicSessions: async (limit = 20) => {
    const response = await api.get('/sessions/public/list', { params: { limit } });
    return response.data;
  },

  // Update session
  update: async (sessionId, updateData) => {
    const response = await api.put(`/sessions/${sessionId}`, updateData);
    return response.data;
  },

  // Leave session
  leave: async (sessionId) => {
    const response = await api.post(`/sessions/${sessionId}/leave`);
    return response.data;
  },

  // Delete/End session
  delete: async (sessionId) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },

  // Get session history
  getHistory: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/history`);
    return response.data;
  },
};

// Code execution API endpoints
export const executeAPI = {
  // Execute code
  run: async (executionData) => {
    const response = await api.post('/execute/run', executionData);
    return response.data;
  },

  // Get supported languages
  getLanguages: async () => {
    const response = await api.get('/execute/languages');
    return response.data;
  },

  // Validate code syntax
  validate: async (codeData) => {
    const response = await api.post('/execute/validate', codeData);
    return response.data;
  },

  // Get execution statistics
  getStats: async () => {
    const response = await api.get('/execute/stats');
    return response.data;
  },

  // Share execution result
  share: async (shareData) => {
    const response = await api.post('/execute/share', shareData);
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('codecollab-token');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('codecollab-token');
  },

  // Set token
  setToken: (token) => {
    localStorage.setItem('codecollab-token', token);
  },

  // Clear token
  clearToken: () => {
    localStorage.removeItem('codecollab-token');
  },

  // Handle API errors consistently
  handleError: (error, customMessage) => {
    const message = error.response?.data?.error || customMessage || 'An error occurred';
    toast.error(message);
    throw error;
  },

  // Format error for display
  formatError: (error) => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(
      (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/health',
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    throw new Error('Backend service is unavailable');
  }
};

export default api;