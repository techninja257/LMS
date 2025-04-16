import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import VerifyEmail from './pages/VerifyEmail';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EnrolledCourses from './pages/EnrolledCourses';
import CourseContent from './pages/CourseContent';
import LessonView from './pages/LessonView';
import QuizAttempt from './pages/QuizAttempt';
import Certificate from './pages/Certificate';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import CourseApprovals from './pages/admin/CourseApprovals';
import UserCreate from './pages/admin/UserCreate';

// Instructor Pages
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCourses from './pages/instructor/InstructorCourses'; // Added this import
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import ManageLessons from './pages/instructor/ManageLessons';
import CreateLesson from './pages/instructor/CreateLesson';
import EditLesson from './pages/instructor/EditLesson';
import CreateQuiz from './pages/instructor/CreateQuiz';
import EditQuiz from './pages/instructor/EditQuiz';

// Route Guards
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import InstructorRoute from './components/common/InstructorRoute';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        {user && <Sidebar />}

        <main className={`flex-1 p-4 ${user ? 'ml-0 md:ml-64' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/enrolled-courses" element={<PrivateRoute><EnrolledCourses /></PrivateRoute>} />
            <Route path="/courses/:courseId/content" element={<PrivateRoute><CourseContent /></PrivateRoute>} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<PrivateRoute><LessonView /></PrivateRoute>} />
            <Route path="/courses/:courseId/quizzes/:quizId" element={<PrivateRoute><QuizAttempt /></PrivateRoute>} />
            <Route path="/courses/:courseId/certificate" element={<PrivateRoute><Certificate /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
            <Route path="/admin/users/create" element={<AdminRoute><UserCreate /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><ManageCourses /></AdminRoute>} />
            <Route path="/admin/course-approvals" element={<AdminRoute><CourseApprovals /></AdminRoute>} />

            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<InstructorRoute><InstructorDashboard /></InstructorRoute>} />
            <Route path="/instructor/courses" element={<InstructorRoute><InstructorCourses /></InstructorRoute>} /> {/* Added this route */}
            <Route path="/instructor/courses/create" element={<InstructorRoute><CreateCourse /></InstructorRoute>} />
            <Route path="/instructor/courses/:courseId/edit" element={<InstructorRoute><EditCourse /></InstructorRoute>} />
            <Route path="/instructor/courses/:courseId/lessons" element={<InstructorRoute><ManageLessons /></InstructorRoute>} />
            <Route path="/instructor/courses/:courseId/lessons/create" element={<InstructorRoute><CreateLesson /></InstructorRoute>} />
            <Route path="/instructor/courses/:courseId/lessons/:lessonId/edit" element={<InstructorRoute><EditLesson /></InstructorRoute>} />
            <Route path="/instructor/courses/:courseId/quizzes/create" element={<InstructorRoute><CreateQuiz /></InstructorRoute>} />
            <Route path="/instructor/courses/:courseId/quizzes/:quizId/edit" element={<InstructorRoute><EditQuiz /></InstructorRoute>} />
          </Routes>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;