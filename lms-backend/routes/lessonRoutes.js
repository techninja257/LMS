const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createLesson, uploadMaterial, getCourseLessons, completeLesson } = require('../controllers/lessonController');

// Log to verify imports
console.log('Imported lessonController in lessonRoutes:', {
  createLesson: typeof createLesson,
  uploadMaterial: typeof uploadMaterial,
  getCourseLessons: typeof getCourseLessons,
  completeLesson: typeof completeLesson
});

// Log middleware
console.log('Middleware:', {
  authProtect: typeof auth.protect,
  upload: typeof upload,
  uploadSingle: typeof upload.single === 'function' ? 'function' : upload.single
});

// Course-specific lesson routes
console.log('Defining route: POST /courses/:courseId/lessons with handler:', typeof createLesson);
router.post('/courses/:courseId/lessons', auth.protect, createLesson);

console.log('Defining route: GET /courses/:courseId/lessons with handler:', typeof getCourseLessons);
router.get('/courses/:courseId/lessons', auth.protect, getCourseLessons);

// Lesson-specific routes
console.log('Defining route: POST /:lessonId/material with handler:', typeof uploadMaterial);
router.post('/:lessonId/material', auth.protect, upload.single('file'), uploadMaterial);

console.log('Defining route: PATCH /:lessonId/complete with handler:', typeof completeLesson);
router.patch('/:lessonId/complete', auth.protect, completeLesson);

module.exports = router;