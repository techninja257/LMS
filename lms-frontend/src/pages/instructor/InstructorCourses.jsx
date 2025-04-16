// src/pages/instructor/InstructorCourses.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../../api/courses';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const InstructorCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Get courses authored by the current user
        const response = await getAllCourses({
          author: user.id,
          limit: 100
        });
        
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [user.id]);

  // Helper function to get status badge color
  const getStatusColor = (isPublished, isApproved, requiresApproval) => {
    if (isPublished) {
      return 'bg-green-100 text-green-800';
    } else if (requiresApproval && !isApproved) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get status text
  const getStatusText = (isPublished, isApproved, requiresApproval) => {
    if (isPublished) {
      return 'Published';
    } else if (requiresApproval && !isApproved) {
      return 'Pending Approval';
    } else if (isApproved) {
      return 'Approved (Draft)';
    } else {
      return 'Draft';
    }
  };

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
          <h2 className="text-xl font-semibold mb-2">Error loading courses</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        
        <Link to="/instructor/courses/create">
          <Button variant="primary">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Course
          </Button>
        </Link>
      </div>
      
      <Card>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't created any courses yet. Get started by creating your first course.
            </p>
            <Link to="/instructor/courses/create">
              <Button variant="primary">Create Your First Course</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map(course => (
                  <tr key={course._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded object-cover" 
                            src={course.coverImage || '/assets/images/default-course.jpg'} 
                            alt={course.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${getStatusColor(course.isPublished, course.isApproved, course.requiresApproval)}`}>
                        {getStatusText(course.isPublished, course.isApproved, course.requiresApproval)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/instructor/courses/${course._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <Link 
                          to={`/instructor/courses/${course._id}/lessons`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Lessons
                        </Link>
                        <Link 
                          to={`/courses/${course._id}`}
                          className="text-green-600 hover:text-green-900"
                          target="_blank"
                        >
                          Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InstructorCourses;