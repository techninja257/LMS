// src/pages/instructor/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../../api/courses';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    pendingApproval: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        setLoading(true);
        
        // Get courses authored by the current user
        const response = await getAllCourses({
          author: user.id,
          limit: 100
        });
        
        setCourses(response.data);
        
        // Calculate stats
        const totalCourses = response.data.length;
        const publishedCourses = response.data.filter(course => course.isPublished).length;
        const pendingApproval = response.data.filter(
          course => course.requiresApproval && !course.isApproved
        ).length;
        
        // Calculate total enrollments (assuming we have this data)
        const totalEnrollments = response.data.reduce(
          (sum, course) => sum + (course.enrollments?.length || 0),
          0
        );
        
        setStats({
          totalCourses,
          publishedCourses,
          pendingApproval,
          totalEnrollments
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching instructor data:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchInstructorCourses();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-danger-50 text-danger-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Error loading dashboard</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Instructor Dashboard
          </h1>
          // src/pages/instructor/Dashboard.jsx (continued)
          <p className="text-gray-600">
            Welcome back, {user.firstName}! Manage your courses and see their performance.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link to="/instructor/courses/create">
            <Button variant="primary">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Course
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-700">Total Courses</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-700">Published</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.publishedCourses}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-700">Pending Approval</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingApproval}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-700">Total Enrollments</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEnrollments}</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Course List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Courses</h2>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No courses yet</h3>
            <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
            <Link to="/instructor/courses/create">
              <Button variant="primary">Create Your First Course</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {courses.map(course => (
              <div key={course._id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start mb-4 md:mb-0">
                  <img 
                    src={course.coverImage || '/assets/images/default-course.jpg'} 
                    alt={course.title}
                    className="h-16 w-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span>{course.level}</span>
                      <span>•</span>
                      <span>{course.duration} weeks</span>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                      
                      {course.requiresApproval && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/instructor/courses/${course._id}/edit`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                  >
                    Edit
                  </Link>
                  
                  <Link
                    to={`/instructor/courses/${course._id}/lessons`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Lessons
                  </Link>
                  
                  <Link
                    to={`/courses/${course._id}`}
                    target="_blank"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default InstructorDashboard;