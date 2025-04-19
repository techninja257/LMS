import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllCourses, enrollCourse } from '../api/courses';
import { getEnrolledCourses } from '../api/courses';
import { useAuth } from '../hooks/useAuth';
import CourseList from '../components/course/CourseList';
import Card from '../components/common/Card';
import FormSelect from '../components/common/FormSelect';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../config';

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    page: 1,
    limit: 12
  });
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllCourses(filters);
        setCourses(response.data || []);
        setTotalCourses(response.total || response.data.length || 0);
        setTotalPages(Math.ceil((response.total || response.data.length || 0) / filters.limit));
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        toast.error('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;

      try {
        const enrolledCourses = await getEnrolledCourses();
        const enrollmentMap = {};
        enrolledCourses.forEach(course => {
          enrollmentMap[course._id] = {
            enrollmentId: course.enrollmentId,
            completionPercentage: course.completionPercentage,
            status: course.status
          };
        });
        setEnrollments(enrollmentMap);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        toast.error('Failed to load enrollments.');
      }
    };

    fetchEnrollments();
  }, [user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }

    try {
      await enrollCourse(courseId);
      setEnrollments(prev => ({
        ...prev,
        [courseId]: {
          enrollmentId: Date.now(),
          completionPercentage: 0,
          status: 'active'
        }
      }));
      toast.success('Successfully enrolled in the course!');
      navigate(`/courses/${courseId}/content`);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error(err.response?.data?.error || 'Failed to enroll in course.');
    }
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...COURSE_CATEGORIES.map(category => ({
      value: category,
      label: category
    }))
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    ...COURSE_LEVELS.map(level => ({
      value: level,
      label: level
    }))
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Courses</h1>
        <p className="text-gray-600">
          Discover our wide range of courses to enhance your skills and knowledge.
        </p>
      </div>

      <Card className="mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormSelect
              name="category"
              label="Category"
              options={categoryOptions}
              value={filters.category}
              onChange={handleFilterChange}
            />
            <FormSelect
              name="level"
              label="Level"
              options={levelOptions}
              value={filters.level}
              onChange={handleFilterChange}
            />
            <FormInput
              type="text"
              name="search"
              label="Search"
              placeholder="Search for courses..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Apply Filters
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="mb-8 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {loading ? 'Loading courses...' : `Showing ${courses.length} of ${totalCourses} courses`}
          </h2>
          {totalCourses > 0 && (
            <div className="text-sm text-gray-600">
              Page {filters.page} of {totalPages}
            </div>
          )}
        </div>

        <CourseList
          courses={courses}
          loading={loading}
          error={error}
          showEnrollButton={true}
          enrollments={enrollments}
          onEnroll={handleEnroll}
          emptyMessage="No courses match your filters. Try adjusting your search criteria."
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border border-gray-300 text-sm font-medium ${
                  page === filters.page
                    ? 'bg-primary-50 text-primary-600 border-primary-500'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === totalPages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Courses;