import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Main Pages
import Home from '../pages/Home';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyEmail from '../pages/VerifyEmail';
import EnrolledCourses from '../pages/EnrolledCourses';
import CourseContent from '../pages/CourseContent';
import LessonView from '../pages/LessonView';
import QuizAttempt from '../pages/QuizAttempt';
import Certificate from '../pages/Certificate';
import CourseDetail from '../pages/CourseDetail';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminUserCreate from '../pages/admin/UserCreate';
import AdminUserEdit from '../pages/admin/UserEdit';
import AdminCourses from '../pages/admin/Courses';
import AdminCourseCreate from '../pages/admin/CourseCreate';
import AdminCourseEdit from '../pages/admin/CourseEdit';

// Auth
import Login from '../pages/Login';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      
      {/* Protected routes */}
      <Route path="/dashboard/courses" element={
        <PrivateRoute>
          <EnrolledCourses />
        </PrivateRoute>
      } />
      <Route path="/courses/:courseId/content" element={
        <PrivateRoute>
          <CourseContent />
        </PrivateRoute>
      } />
      <Route path="/courses/:courseId/lesson/:lessonId" element={
        <PrivateRoute>
          <LessonView />
        </PrivateRoute>
      } />
      <Route path="/courses/:courseId/quiz/:quizId" element={
        <PrivateRoute>
          <QuizAttempt />
        </PrivateRoute>
      } />
      <Route path="/courses/:courseId/certificate" element={
        <PrivateRoute>
          <Certificate />
        </PrivateRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      } />
      
      <Route path="/admin/users/create" element={
        <AdminRoute>
          <AdminUserCreate />
        </AdminRoute>
      } />
      
      <Route path="/admin/users/:userId/edit" element={
        <AdminRoute>
          <AdminUserEdit />
        </AdminRoute>
      } />
      
      <Route path="/admin/courses" element={
        <AdminRoute>
          <AdminCourses />
        </AdminRoute>
      } />
      
      <Route path="/admin/courses/create" element={
        <AdminRoute>
          <AdminCourseCreate />
        </AdminRoute>
      } />
      
      <Route path="/admin/courses/:courseId/edit" element={
        <AdminRoute>
          <AdminCourseEdit />
        </AdminRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;