// src/pages/admin/CourseApprovals.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses, approveCourse } from '../../api/courses';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const CourseApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingCourses = async () => {
      try {
        setLoading(true);
        
        // Get courses that require approval and are not yet approved
        const response = await getAllCourses({
          requiresApproval: true,
          isApproved: false,
          limit: 100 // Assuming there won't be too many pending courses
        });
        
        setPendingCourses(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pending courses:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchPendingCourses();
  }, []);

  // Handle course approval
  const handleApproveCourse = async (courseId) => {
    try {
      await approveCourse(courseId);
      
      // Update local state by removing the approved course
      setPendingCourses(prev => prev.filter(course => course._id !== courseId));
      
      toast.success('Course approved successfully');
    } catch (err) {
      console.error('Error approving course:', err);
      toast.error('Failed to approve course. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Course Approvals</h1>
      
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-md">
            <h3 className="font-medium">Error loading courses</h3>
            <p>{error.message || 'An unexpected error occurred.'}</p>
          </div>
        ) : pendingCourses.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">All Caught Up!</h3>
            <p className="text-gray-600">There are no courses pending approval.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 px-6 pt-4">
              Courses Pending Approval ({pendingCourses.length})
            </h2>
            
            <div className="divide-y divide-gray-200">
              {pendingCourses.map(course => (
                <div key={course._id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
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
                        <span>
                          {typeof course.author === 'object' 
                            ? `${course.author.firstName} ${course.author.lastName}`
                            : 'Unknown Author'
                          }
                        </span>
                        <span>•</span>
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {course.summary || course.description?.substring(0, 150)}
                        {course.description?.length > 150 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 md:items-end">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/courses/${course._id}`}
                        target="_blank"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        Preview
                      </Link>
                      
                      <Button
                        variant="primary"
                        onClick={() => handleApproveCourse(course._id)}
                      >
                        Approve
                      </Button>
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      Submitted on {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CourseApprovals;