import axios from 'axios';

export const createLesson = async (courseId, lessonData) => {
  const response = await api.post(`/lessons/courses/${courseId}/lessons`, lessonData);
  return response.data;
};

export const uploadLessonMaterial = async (lessonId, file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify(metadata));
  const response = await axios.post(`/api/lessons/${lessonId}/material`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getLesson = async (lessonId) => {
  const response = await axios.get(`/api/lessons/${lessonId}`);
  return response.data;
};

export const updateLesson = async (lessonId, lessonData) => {
  const response = await axios.put(`/api/lessons/${lessonId}`, lessonData);
  return response.data;
};

export const deleteLesson = async (lessonId) => {
  const response = await api.delete(`/lessons/${lessonId}`);
  return response.data;
};

export const getCourseLessons = async (courseId) => {
  const response = await api.get(`/lessons/courses/${courseId}/lessons`);
  return response.data;
};

export const completeLesson = async (lessonId) => {
  const response = await axios.patch(`/api/lessons/${lessonId}/complete`);
  return response.data;
};