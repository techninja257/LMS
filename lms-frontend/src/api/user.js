// src/api/users.js
import api from './auth'; // Import the configured axios instance

// Get all users (admin only)
export const getAllUsers = async (query = {}) => {
  try {
    // Convert query object to URL parameters
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get(`/api/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single user by ID (admin only)
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Create user (admin only)
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/users', userData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Update user (admin only)
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (userId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.put(`/api/users/${userId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Get user profile with enrolled courses
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}/profile`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Reset user password (admin only)
export const resetUserPassword = async (userId) => {
  try {
    const response = await api.put(`/api/users/${userId}/reset-password`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};