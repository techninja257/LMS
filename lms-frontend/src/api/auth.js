import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api.get('/api/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await api.put(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/api/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user details
export const updateUserDetails = async (userData) => {
  try {
    const response = await api.put('/api/auth/update-details', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/auth/update-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; // Export the configured axios instance for use in other API modules