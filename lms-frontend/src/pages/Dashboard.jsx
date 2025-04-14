import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getEnrolledCourses } from '../api/courses';
import { getUserNotifications } from '../api/notifications';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CourseCard from '../components/course/CourseCard';
import { getUsers } from '../api/user';

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled courses
        const courses = await getEnrolledCourses();
        setEnrolledCourses(courses);
        
        // Fetch recent notifications
        const notificationData = await getUserNotifications(5);
        setNotifications(notificationData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Get courses in progress
  const inProgressCourses = enrolledCourses.filter(
    course => course.completionPercentage > 0 && course.completionPercentage < 100
  );
  
  // Get recently enrolled courses
  const recentlyEnrolled = [...enrolledCourses]
    .sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate))
    .slice(0, 3);
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (enrolledCourses.length === 0) return 0;
    
    const totalProgress = enrolledCourses.reduce(
      (sum, course) => sum + course.completionPercentage,
      0
    );
    
    return Math.round(totalProgress / enrolledCourses.length);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Track your progress and continue learning from where you left off.
        </p>
      </div>
      
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Enrolled Courses */}
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Enrolled Courses
              </h3>
              <p className="text-3xl font-bold text-blue-700">
                {enrolledCourses.length}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Courses Completed */}
        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Completed
              </h3>
              <p className="text-3xl font-bold text-green-700">
                {enrolledCourses.filter(course => course.completionPercentage === 100).length}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Overall Progress */}
        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Overall Progress
              </h3>
              <p className="text-3xl font-bold text-purple-700">
                {calculateOverallProgress()}%
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Courses In Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Continue Learning
          </h2>
          <Link to="/enrolled-courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all courses
          </Link>
        </div>
        
        {inProgressCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.slice(0, 3).map(course => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={true}
                progress={course.completionPercentage}
                hideActions={false}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses in progress
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't started any courses yet. Explore our catalog to find courses you're interested in.
            </p>
            <Link to="/courses">
              <Button variant="primary">Browse Courses</Button>
            </Link>
          </Card>
        )}
      </div>
      
      {/* Recent Notifications */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Notifications
          </h2>
          <Link to="/notifications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all notifications
          </Link>
        </div>
        
        <Card>
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div key={notification._id} className={`py-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                  <div className="flex">
                    <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${!notification.read ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-600">
                You have no new notifications.
              </p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Recently Enrolled Courses */}
      {recentlyEnrolled.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Recently Enrolled
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentlyEnrolled.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={true}
                progress={course.completionPercentage}
                hideActions={false}
                compact={true}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Explore More Courses */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to expand your skills?
          </h2>
          <p className="text-primary-100 mb-6">
            Explore our catalog to discover new courses and enhance your knowledge.
          </p>
          <Link to="/courses">
            <Button variant="secondary" className="font-semibold shadow-sm">
              Browse All Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;