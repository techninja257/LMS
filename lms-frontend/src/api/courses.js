import api from './auth'; // Import the configured axios instance

// Get all courses
export const getAllCourses = async (query = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await api.get(`/api/courses?${params.toString()}`);
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch courses');
  }
};

// Get single course
export const getCourse = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch course');
  }
};

// Create course (instructor, admin)
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/api/courses', courseData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .map((err) => err.message)
        .join(', ');
      throw new Error(errorMessages);
    }
    throw new Error(error.response?.data?.message || 'Failed to create course');
  }
};

// Update course (instructor, admin)
export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/api/courses/${courseId}`, courseData);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update course');
  }
};

// Delete course (instructor, admin)
export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete course');
  }
};

// Upload course image
export const uploadCourseImage = async (courseId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.put(`/api/courses/${courseId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

// Enroll in course
export const enrollCourse = async (courseId) => {
  try {
    const response = await api.post(`/api/courses/${courseId}/enroll`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to enroll in course');
  }
};

// Unenroll from course
export const unenrollCourse = async (courseId) => {
  try {
    const response = await api.delete(`/api/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to unenroll from course');
  }
};

// Get enrolled courses
export const getEnrolledCourses = async () => {
  try {
    const response = await api.get('/api/courses/enrolled');
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch enrolled courses');
  }
};

// Approve course (admin only)
export const approveCourse = async (courseId) => {
  try {
    const response = await api.put(`/api/courses/${courseId}/approve`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve course');
  }
};

// Generate certificate for completed course
export const generateCertificate = async (courseId) => {
  try {
    const response = await api.post(`/api/courses/${courseId}/certificate`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate certificate');
  }
};

// Submit course for approval
export const submitCourseForApproval = async (courseId) => {
  try {
    const response = await api.put(`/api/courses/${courseId}/submit`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit course for approval');
  }
};

// Publish/unpublish course
export const publishCourse = async (courseId, isPublished) => {
  try {
    const response = await api.put(`/api/courses/${courseId}/publish`, { isPublished });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to publish/unpublish course');
  }
};