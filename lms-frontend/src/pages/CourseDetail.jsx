// File path: lms-frontend/src/pages/CourseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaClock, FaBook, FaGraduationCap, FaLanguage, FaLevelUpAlt, FaCalendarAlt, FaUsers, FaRegBookmark, FaBookmark, FaShare, FaPlayCircle, FaDownload, FaMobileAlt, FaCertificate, FaGift, FaTag } from 'react-icons/fa';

import { getCourse, enrollCourse } from '../api/courses';
import { useAuth } from '../hooks/useAuth'; // Updated import to use the hook
import Button from '../components/common/Button';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Use the hook instead of context directly
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  
  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);
  
  const fetchCourseDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getCourse(courseId);
      setCourse(response.data);
      setIsBookmarked(response.data.isBookmarked || false);
    } catch (err) {
      setError('Failed to load course details. Please try again later.');
      console.error('Error fetching course:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEnroll = async () => {
    // Check if user is an instructor or admin and prevent enrollment
    if (isAuthenticated && (user.role === 'instructor' || user.role === 'admin')) {
      setEnrollmentError('As an instructor or admin, you cannot enroll in courses.');
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/courses/${courseId}` } });
      return;
    }
    
    setIsEnrolling(true);
    setEnrollmentError('');
    
    try {
      await enrollCourse(courseId);
      navigate(`/courses/${courseId}/content`);
    } catch (err) {
      setEnrollmentError(err.response?.data?.message || 'Failed to enroll in the course. Please try again.');
      console.error('Error enrolling in course:', err);
    } finally {
      setIsEnrolling(false);
    }
  };
  
  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/courses/${courseId}` } });
      return;
    }
    
    // Implement bookmark toggle logic with API
    setIsBookmarked(!isBookmarked);
  };
  
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    
    return <div className="flex items-center">{stars}</div>;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen-minus-nav">
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
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Course not found</span>
        </div>
      </div>
    );
  }

  // Determine if user is author of the course
  const isAuthor = isAuthenticated && user && course.author && 
                  (typeof course.author === 'object' ? 
                   course.author._id === user.id : course.author === user.id);
                   
  // Check if user is an instructor/admin but not the author
  const isInstructorOrAdmin = isAuthenticated && user && 
                             (user.role === 'instructor' || user.role === 'admin') && 
                             !isAuthor;
  
  // Return full component  
  return (
    <div className="bg-gray-50 min-h-screen-minus-nav">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start">
            {/* Left column: Course preview image */}
            <div className="md:w-5/12 mb-6 md:mb-0 md:pr-8">
              <div className="relative rounded-lg overflow-hidden shadow-lg bg-black">
                <img
                  src={course.coverImage || '/images/course-placeholder.jpg'}
                  alt={course.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '16 / 9' }}
                />
                {course.previewVideoUrl && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
                    <span className="sr-only">Play preview</span>
                    <FaPlayCircle className="text-white text-5xl" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right column: Course details */}
            <div className="md:w-7/12">
              {/* Course status for instructor/admin */}
              {(isAuthor || isInstructorOrAdmin) && (
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
                  <Link
                    to={`/courses?category=${course.category}`}
                    className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full hover:bg-white/30"
                  >
                    {course.category}
                  </Link>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-white/90 text-lg mb-6">{course.shortDescription || course.summary}</p>
              
              <div className="flex items-center mb-4">
                {renderStarRating(course.averageRating || 0)}
                <span className="ml-2 font-medium">
                  {course.averageRating?.toFixed(1) || '0.0'} 
                  <span className="text-white/80 ml-1">
                    ({course.reviewCount || 0} {course.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </span>
              </div>
              
              <div className="flex items-center mb-4">
                <img
                  src={typeof course.author === 'object' ? 
                       (course.author.profileImage || '/images/default-avatar.png') :
                       '/images/default-avatar.png'}
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
                  <FaCalendarAlt className="mr-2" />
                  <span>Last updated {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="mr-2" />
                  <span>{course.enrollmentCount || course.enrolledUsers?.length || 0} students</span>
                </div>
                <div className="flex items-center">
                  <FaLanguage className="mr-2" />
                  <span>{course.language || 'English'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Action Box (Sticky on Mobile) */}
      <div className="sticky top-16 z-10 bg-white border-b shadow-sm md:hidden py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {course.isFree ? 'Free' : `$${course.price?.toFixed(2) || '0.00'}`}
            </div>
            {course.originalPrice && !course.isFree && (
              <div className="text-gray-500 line-through text-sm">
                ${course.originalPrice.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBookmark}
              className="flex items-center"
            >
              {isBookmarked ? <FaBookmark className="mr-1" /> : <FaRegBookmark className="mr-1" />}
            </Button>
            
            {/* Conditionally show enroll or edit button */}
            {isAuthor ? (
              <Link to={`/instructor/courses/${course._id}/edit`}>
                <Button
                  variant="primary"
                  size="sm"
                >
                  Edit Course
                </Button>
              </Link>
            ) : isInstructorOrAdmin ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={true}
              >
                Instructor View
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnroll}
                isLoading={isEnrolling}
              >
                {course.isEnrolled ? 'Go to Course' : course.isFree ? 'Enroll for Free' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="md:w-8/12">
            {enrollmentError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                <span className="block sm:inline">{enrollmentError}</span>
              </div>
            )}
            
            {/* Tabs */}
            <div className="mb-6 border-b">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 px-1 font-medium ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`pb-4 px-1 font-medium ${
                    activeTab === 'curriculum'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab('instructor')}
                  className={`pb-4 px-1 font-medium ${
                    activeTab === 'instructor'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Instructor
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 px-1 font-medium ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Reviews
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: course.description }}></div>
                  </div>
                  
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
                  
                  {course.targetAudience && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">Who This Course is For</h3>
                      <p className="text-gray-700">{course.targetAudience}</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'curriculum' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaBook className="mr-2" />
                      <span>{course.modulesCount || course.modules?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center">
                      <FaPlayCircle className="mr-2" />
                      <span>{course.lessonsCount || course.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>Total length: {course.totalDuration || '0h 0m'}</span>
                    </div>
                  </div>
                  
                  {/* Curriculum preview */}
                  <div className="border rounded-lg divide-y">
                    {course.modules && course.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="p-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Module {moduleIndex + 1}: {module.title}</h3>
                          <span className="text-sm text-gray-500">
                            {module.lessons ? module.lessons.length : 0} lessons
                          </span>
                        </div>
                        
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                        
                        {/* Preview lessons - this would need to be expanded */}
                        <div className="mt-3">
                          <p className="text-sm text-primary-600">
                            {course.isEnrolled 
                              ? "View all lessons in this module" 
                              : "Enroll to access all lessons in this module"}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {(!course.modules || course.modules.length === 0) && (
                      <div className="p-4 text-center text-gray-500">
                        No curriculum information available
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'instructor' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>
                  
                  <div className="flex items-start mb-6">
                    <img
                      src={typeof course.author === 'object' ? 
                          (course.author.profileImage || '/images/default-avatar.png') :
                          '/images/default-avatar.png'}
                      alt={typeof course.author === 'object' ? 
                          `${course.author.firstName} ${course.author.lastName}` : 'Instructor'}
                      className="w-20 h-20 rounded-full mr-6 object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {typeof course.author === 'object' ? 
                         `${course.author.firstName} ${course.author.lastName}` : 'Unknown Instructor'}
                      </h3>
                      <p className="text-gray-600 mb-2">{course.author?.title || 'Instructor'}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaStar className="mr-1 text-yellow-500" />
                          <span>{course.author?.averageRating?.toFixed(1) || '0.0'} Instructor Rating</span>
                        </div>
                        <div className="flex items-center">
                          <FaGraduationCap className="mr-1" />
                          <span>{course.author?.reviewCount || 0} Reviews</span>
                        </div>
                        <div className="flex items-center">
                          <FaUsers className="mr-1" />
                          <span>{course.author?.studentsCount || 0} Students</span>
                        </div>
                        <div className="flex items-center">
                          <FaBook className="mr-1" />
                          <span>{course.author?.coursesCount || 0} Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: course.author?.bio || 'No instructor bio available.' }}></div>
                  </div>
                </div>
              )}
              
              {/* Reviews tab content omitted for brevity */}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-4/12">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
              {course.previewVideoUrl ? (
                <div className="relative bg-black aspect-video">
                  <img
                    src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
                    <span className="sr-only">Play preview</span>
                    <FaPlayCircle className="text-white text-5xl" />
                  </button>
                </div>
              ) : (
                <img
                  src={course.coverImage || '/images/course-placeholder.jpg'}
                  alt={course.title}
                  className="w-full h-auto object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-primary-600">
                      {course.isFree ? 'Free' : `$${course.price?.toFixed(2) || '0.00'}`}
                    </div>
                    {course.originalPrice && !course.isFree && (
                      <div className="flex items-center">
                        <span className="text-gray-500 line-through mr-2">
                          ${course.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% off
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleBookmark}
                    className="flex items-center"
                  >
                    {isBookmarked ? <FaBookmark className="mr-1" /> : <FaRegBookmark className="mr-1" />}
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                </div>
                
                {isAuthor ? (
                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Button
                      variant="primary"
                      className="w-full mb-4"
                    >
                      Edit Course
                    </Button>
                  </Link>
                ) : isInstructorOrAdmin ? (
                  <Button
                    variant="secondary"
                    className="w-full mb-4"
                    disabled={true}
                  >
                    Instructor View
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full mb-4"
                    onClick={handleEnroll}
                    isLoading={isEnrolling}
                  >
                    {course.isEnrolled ? 'Go to Course' : course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                  </Button>
                )}
                
                <p className="text-center text-sm text-gray-600 mb-6">
                  {course.moneyBackGuarantee ? '30-Day Money-Back Guarantee' : 'Full lifetime access'}
                </p>
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">This course includes:</h3>
                  
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                      <FaPlayCircle className="text-gray-500 mr-3" />
                      <span>{course.videoDuration || '0 hours'} of on-demand video</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <FaBook className="text-gray-500 mr-3" />
                      <span>{course.articlesCount || 0} articles</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <FaDownload className="text-gray-500 mr-3" />
                      <span>{course.resourcesCount || 0} downloadable resources</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <FaClock className="text-gray-500 mr-3" />
                      <span>Full lifetime access</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <FaMobileAlt className="text-gray-500 mr-3" />
                      <span>Access on mobile and TV</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <FaCertificate className="text-gray-500 mr-3" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-b py-6 my-6">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <FaShare className="mr-1" /> Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <FaGift className="mr-1" /> Gift
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <FaTag className="mr-1" /> Apply Coupon
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Training 5 or more people?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get your team access to 17,000+ top courses anytime, anywhere.
                  </p>
                  <Link to="/business" className="text-primary-600 hover:text-primary-700 font-medium">
                    Try LearnHub Business
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;