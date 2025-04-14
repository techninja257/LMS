// Configuration variables for the application

// API base URL - defaults to localhost in development, can be overridden in .env
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Default profile image
export const DEFAULT_PROFILE_IMAGE = '/assets/images/default-profile.jpg';

// Default course image
export const DEFAULT_COURSE_IMAGE = '/assets/images/default-course.jpg';

// Supported file types for uploads
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// File size limits (in bytes)
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Course categories
export const COURSE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX',
  'Data Science',
  'Business',
  'Other'
];

// Course difficulty levels
export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// User roles
export const USER_ROLES = ['student', 'instructor', 'admin'];

// Question types for quizzes
export const QUESTION_TYPES = ['multiple-choice', 'true-false', 'fill-in-blank'];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;