// src/pages/CourseDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCourse, enrollCourse } from '../api/courses';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { DEFAULT_COURSE_IMAGE } from '../config';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  
  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);
  
  const fetchCourseDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(
        err.response?.status === 404
          ? 'Course not found. It may be unpublished or deleted.'
          : 'Failed to load course details. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }
    
    setIsEnrolling(true);
    setEnrollmentError('');
    
    try {
      await enrollCourse(courseId);
      toast.success('Successfully enrolled in the course!');
      navigate(`/courses/${courseId}/content`);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setEnrollmentError(err.response?.data?.error || 'Failed to enroll in course. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };
  
  // Determine if user is author of the course
  const isAuthor = isAuthenticated && user && course?.author && 
                  (typeof course.author === 'object' ? 
                   course.author._id === user.id : course.author === user.id);
                   
  // Check if user is an admin
  const isAdmin = isAuthenticated && user && user.role === 'admin';
  
  // Check if user is an instructor but not the author
  const isInstructor = isAuthenticated && user && user.role === 'instructor' && !isAuthor;
                             
  // Check if user is already enrolled
  const isEnrolled = course?.enrolledUsers?.some(userId => 
    userId.toString() === user?.id || 
    (userId._id && userId._id.toString() === user?.id)
  );
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          {isAdmin && (
            <span className="block sm:inline ml-2">
              Check course status in <Link to="/admin/courses" className="underline">Manage Courses</Link>.
            </span>
          )}
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Course not found</span>
          {isAdmin && (
            <span className="block sm:inline ml-2">
              Check course status in <Link to="/admin/courses" className="underline">Manage Courses</Link>.
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start">
            {/* Left column: Course preview image */}
            <div className="md:w-5/12 mb-6 md:mb-0 md:pr-8">
              <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
                <img
                  src={course.image || DEFAULT_COURSE_IMAGE}
                  alt={course.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '16 / 9' }}
                />
              </div>
            </div>
            
            {/* Right column: Course details */}
            <div className="md:w-7/12">
              {/* Course status for instructor/admin/author */}
              {(isAuthor || isInstructor || isAdmin) && (
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 
                    ${course.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {course.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {course.category && (
                  <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-white/90 text-lg mb-6">{course.summary || course.description?.substring(0, 150)}</p>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 font-medium">
                    {course.averageRating?.toFixed(1) || '0.0'} 
                    <span className="text-white/80 ml-1">
                      ({course.reviewCount || 0} {course.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <img
                  src={typeof course.author === 'object' ? 
                       (course.author.profileImage || '/assets/images/default-avatar.png') :
                       '/assets/images/default-avatar.png'}
                  alt={typeof course.author === 'object' ? 
                       `${course.author.firstName} ${course.author.lastName}` : 'Instructor'}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="font-medium">Created by</p>
                  <span className="hover:text-white/80">
                    {typeof course.author === 'object' ? 
                     `${course.author.firstName} ${course.author.lastName}` : 'Unknown Instructor'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-6 text-white/90 text-sm mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>{course.enrollmentCount || course.enrolledUsers?.length || 0} students</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{course.language || 'English'}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {isAuthor ? (
                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Button variant="primary">
                      Edit Course
                    </Button>
                  </Link>
                ) : isAdmin ? (
                  <Link to={`/admin/courses/${course._id}/edit`}>
                    <Button variant="primary">
                      Edit Course
                    </Button>
                  </Link>
                ) : isInstructor ? (
                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Button variant="secondary">
                      Instructor View
                    </Button>
                  </Link>
                ) : isEnrolled ? (
                  <Link to={`/courses/${course._id}/content`}>
                    <Button variant="primary">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleEnroll}
                    isLoading={isEnrolling}
                  >
                    {course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                  </Button>
                )}
                
                <Button variant="outline" className="text-white border-white hover:bg-white/20">
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message for enrollment */}
      {enrollmentError && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{enrollmentError}</span>
          </div>
        </div>
      )}
      
      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:w-8/12">
            {/* Tabs */}
            <Card className="mb-8">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button className="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600">
                    About
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Curriculum
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Instructor
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Reviews
                  </button>
                </nav>
              </div>
              
              {/* About Tab Content */}
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                <div dangerouslySetInnerHTML={{ __html: course.description || 'No description available.' }} />
                
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {course.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {course.prerequisites.map((prerequisite, index) => (
                        <li key={index}>{prerequisite}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Right Column - Course Info Card */}
          <div className="lg:w-4/12">
            <div className="sticky top-24">
              <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Course Information</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration || 'N/A'} weeks</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{course.category || 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{course.language || 'English'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{course.enrollmentCount || course.enrolledUsers?.length || 0}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
                  </li>
                </ul>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Share This Course</h4>
                  <div className="flex space-x-3">
                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </button>
                    <button className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.374 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.626-5.374-12-12-12z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
              
              {/* CTA Card */}
              {!isEnrolled && !isAuthor && !isAdmin && !isInstructor && (
                <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Ready to start learning?</h3>
                    <div className="text-2xl font-bold">
                      {course.isFree ? 'Free' : `$${course.price || '0.00'}`}
                    </div>
                  </div>
                  <Button
                    variant="light"
                    className="w-full bg-white text-primary-700 hover:bg-gray-100"
                    onClick={handleEnroll}
                    isLoading={isEnrolling}
                  >
                    {course.isFree ? 'Enroll Now - Free' : 'Enroll Now'}
                  </Button>
                  <p className="text-sm mt-3 text-center text-white/80">
                    {course.isFree ? 'Full access to course content' : '30-day money-back guarantee'}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;