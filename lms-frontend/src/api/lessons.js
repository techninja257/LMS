import api from './auth'; // Import the configured axios instance

// Get all lessons for a course
export const getCourseLessons = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/lessons`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Get single lesson
export const getLesson = async (lessonId) => {
  try {
    const response = await api.get(`/api/lessons/${lessonId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Create lesson (instructor, admin)
export const createLesson = async (courseId, lessonData) => {
  try {
    const response = await api.post(`/api/courses/${courseId}/lessons`, lessonData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Update lesson (instructor, admin)
export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/api/lessons/${lessonId}`, lessonData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Delete lesson (instructor, admin)
export const deleteLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/api/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload lesson material (PDF, video)
export const uploadLessonMaterial = async (lessonId, file, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add any metadata like duration or page count
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await api.put(`/api/lessons/${lessonId}/material`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Mark lesson as completed
export const completeLesson = async (lessonId) => {
  try {
    const response = await api.put(`/api/lessons/${lessonId}/complete`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};