import api from './auth'; // Import the configured axios instance

// Get all quizzes for a course
export const getCourseQuizzes = async (courseId) => {
  try {
    const response = await api.get(`/api/courses/${courseId}/quizzes`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Get single quiz
export const getQuiz = async (quizId) => {
  try {
    const response = await api.get(`/api/quizzes/${quizId}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Create quiz (instructor, admin)
export const createQuiz = async (courseId, quizData) => {
  try {
    const response = await api.post(`/api/courses/${courseId}/quizzes`, quizData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Update quiz (instructor, admin)
export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await api.put(`/api/quizzes/${quizId}`, quizData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Delete quiz (instructor, admin)
export const deleteQuiz = async (quizId) => {
  try {
    const response = await api.delete(`/api/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (quizId, answers) => {
  try {
    const response = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};