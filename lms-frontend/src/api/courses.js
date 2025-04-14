import api from './auth'; // Import the configured axios instance

// Get all courses
export const getAllCourses = async (query = {}) => {
  try {
    // Convert query object to URL parameters
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get(`/api/courses?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single course
export const getCourse = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Create course (instructor, admin)
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/api/courses', courseData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Update course (instructor, admin)
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/api/courses/${courseId}`, courseData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Delete course (instructor, admin)
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload course image
export const uploadCourseImage = async (courseId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.put(`/api/courses/${courseId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Enroll in course
export const enrollCourse = async (courseId) => {
  try {
    const response = await api.post(`/api/courses/${courseId}/enroll`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Unenroll from course
export const unenrollCourse = async (courseId) => {
  try {
    const response = await api.delete(`/api/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get enrolled courses
export const getEnrolledCourses = async () => {
  try {
    const response = await api.get('/api/courses/enrolled');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Approve course (admin only)
export const approveCourse = async (courseId) => {
  try {
    const response = await api.put(`/api/courses/${courseId}/approve`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Generate certificate for completed course
export const generateCertificate = async (courseId) => {
  try {
    const response = await api.post(`/api/courses/${courseId}/certificate`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};