import React from 'react';
import CourseCard from './CourseCard';

/**
 * CourseList component for displaying a grid of courses
 * @param {Object} props - Component props
 * @param {Array} props.courses - Array of course objects
 * @param {boolean} [props.loading=false] - Whether courses are loading
 * @param {Object} [props.error=null] - Error object if courses failed to load
 * @param {boolean} [props.showEnrollButton=true] - Whether to show enroll button
 * @param {Object} [props.enrollments={}] - Map of course IDs to enrollment objects
 * @param {Function} [props.onEnroll] - Function to call when Enroll button is clicked
 * @param {string} [props.emptyMessage='No courses found.'] - Message to display when no courses are available
 * @param {boolean} [props.compact=false] - Whether to display courses in compact mode
 * @returns {React.ReactElement} - CourseList component
 */
const CourseList = ({
  courses = [],
  loading = false,
  error = null,
  showEnrollButton = true,
  enrollments = {},
  onEnroll,
  emptyMessage = 'No courses found.',
  compact = false
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-danger-50 text-danger-700 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Error loading courses</h3>
        <p>{error.message || 'An unexpected error occurred. Please try again later.'}</p>
      </div>
    );
  }
  
  // Empty state
  if (!courses.length) {
    return (
      <div className="bg-gray-50 text-gray-600 p-8 rounded-md text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 mx-auto text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }
  
  // Course grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        // Check if user is enrolled in this course
        const enrollment = enrollments[course._id];
        const isEnrolled = !!enrollment;
        
        // Get progress if enrolled
        const progress = isEnrolled ? enrollment.completionPercentage || 0 : 0;
        
        return (
          <CourseCard
            key={course._id}
            course={course}
            isEnrolled={isEnrolled}
            progress={progress}
            onEnroll={showEnrollButton && onEnroll ? onEnroll : undefined}
            compact={compact}
          />
        );
      })}
    </div>
  );
};

export default CourseList;