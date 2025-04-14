// src/pages/EnrolledCourses.jsx
import React, { useState, useEffect } from 'react';
import { getEnrolledCourses } from '../api/courses';
import CourseList from '../components/course/CourseList';
import Card from '../components/common/Card';

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const enrolledCourses = await getEnrolledCourses();
        setCourses(enrolledCourses);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Filter courses based on active filter
  const filteredCourses = () => {
    switch (activeFilter) {
      case 'inProgress':
        return courses.filter(course => 
          course.completionPercentage > 0 && course.completionPercentage < 100
        );
      case 'completed':
        return courses.filter(course => 
          course.completionPercentage === 100
        );
      case 'notStarted':
        return courses.filter(course => 
          course.completionPercentage === 0
        );
      default:
        return courses;
    }
  };

  // Filter button component
  const FilterButton = ({ filter, label }) => (
    <button
      className={`px-4 py-2 text-sm font-medium ${
        activeFilter === filter
          ? 'text-primary-600 border-b-2 border-primary-500'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onClick={() => setActiveFilter(filter)}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Courses</h1>
        <p className="text-gray-600">
          View and manage your enrolled courses.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          <FilterButton filter="all" label="All Courses" />
          <FilterButton filter="inProgress" label="In Progress" />
          <FilterButton filter="completed" label="Completed" />
          <FilterButton filter="notStarted" label="Not Started" />
        </div>
      </div>

      {/* Course list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : courses.length > 0 ? (
        <CourseList
          courses={filteredCourses()}
          loading={false}
          error={error}
          showEnrollButton={false}
          emptyMessage={`You have no ${activeFilter !== 'all' ? activeFilter.replace(/([A-Z])/g, ' $1').toLowerCase() : ''} courses.`}
          enrollments={courses.reduce((acc, course) => {
            acc[course._id] = {
              enrollmentId: course.enrollmentId,
              completionPercentage: course.completionPercentage,
              status: course.status
            };
            return acc;
          }, {})}
        />
      ) : (
        <Card className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
          </p>
          <a href="/courses" className="btn btn-primary">
            Browse Courses
          </a>
        </Card>
      )}
    </div>
  );
};

export default EnrolledCourses;