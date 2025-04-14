import api from './auth'; // Import the configured axios instance

// Get user notifications
export const getUserNotifications = async (limit = 50) => {
  try {
    const response = await api.get(`/api/notifications?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/api/notifications/unread/count');
    return response.data.data.count;
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create notification (admin only)
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post('/api/notifications', notificationData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};