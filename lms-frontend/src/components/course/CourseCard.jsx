import React from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_COURSE_IMAGE } from '../../config';
import Card from '../common/Card';

/**
 * CourseCard component for displaying course information
 * @param {Object} props - Component props
 * @param {Object} props.course - Course data
 * @param {boolean} [props.isEnrolled=false] - Whether the user is enrolled in the course
 * @param {number} [props.progress=0] - User's progress in the course (0-100)
 * @param {Function} [props.onEnroll] - Function to call when Enroll button is clicked
 * @param {boolean} [props.hideActions=false] - Whether to hide action buttons
 * @param {boolean} [props.compact=false] - Whether to display in compact mode
 * @returns {React.ReactElement} - CourseCard component
 */
const CourseCard = ({
  course,
  isEnrolled = false,
  progress = 0,
  onEnroll,
  hideActions = false,
  compact = false
}) => {
  // Format the course duration (weeks)
  const formatDuration = (weeks) => {
    return weeks > 1 ? `${weeks} weeks` : '1 week';
  };
  
  // Get category badge color based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Web Development':
        return 'bg-blue-100 text-blue-800';
      case 'Mobile Development':
        return 'bg-green-100 text-green-800';
      case 'UI/UX':
        return 'bg-purple-100 text-purple-800';
      case 'Data Science':
        return 'bg-yellow-100 text-yellow-800';
      case 'Business':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get level badge color based on level
  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card 
      hoverable
      className="h-full flex flex-col"
    >
      {/* Course Image */}
      <div className="-mx-6 -mt-6 relative">
        <img
          src={course.coverImage || DEFAULT_COURSE_IMAGE}
          alt={course.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(course.category)}`}>
            {course.category}
          </span>
        </div>
        
        {/* Level Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
            {course.level}
          </span>
        </div>
        
        {/* Progress Bar (if enrolled) */}
        {isEnrolled && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-white">
                    {progress}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-300">
                <div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Course Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mt-2 mb-2">
          {course.title}
        </h3>
        
        {!compact && (
          <p className="text-sm text-gray-600 mb-4">
            {course.summary || course.description?.substring(0, 100)}
            {course.description?.length > 100 ? '...' : ''}
          </p>
        )}
        
        {/* Course Meta */}
        <div className="mt-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(course.duration)}
            </div>
            
            {course.author && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {typeof course.author === 'object' 
                  ? `${course.author.firstName} ${course.author.lastName}`
                  : course.author
                }
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {!hideActions && (
            <div className="flex space-x-2">
              <Link 
                to={`/courses/${course._id}`} 
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isEnrolled ? 'Continue' : 'View Details'}
              </Link>
              
              {!isEnrolled && onEnroll && (
                <button
                  onClick={() => onEnroll(course._id)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Enroll Now
                </button>
              )}
              
              {isEnrolled && (
                <Link
                  to={`/courses/${course._id}/content`}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Course
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;