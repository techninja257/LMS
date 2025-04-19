const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');

// Clear module cache for lessonController
delete require.cache[require.resolve('./controllers/lessonController')];

// Load environment variables
dotenv.config();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Import routes
console.log('Loading routes...');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
console.log('Loaded lessonRoutes');
const quizRoutes = require('./routes/quizRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

// Import nested routes
const courseQuizRoutes = require('./routes/courseQuizRoutes');
const courseCertificateRoutes = require('./routes/courseCertificateRoutes');

// Import middlewares
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Connect to MongoDB
require('./config/db')();

// Cloud storage initialization disabled for now
console.log('Cloud storage functionality is disabled for initial testing.');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers with multer for routes that need file uploads
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', upload.single('thumbnail'), courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);

// Mount nested routes
app.use('/api/courses/:courseId/quizzes', courseQuizRoutes);
app.use('/api/courses/:courseId/certificate', courseCertificateRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LMS API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});