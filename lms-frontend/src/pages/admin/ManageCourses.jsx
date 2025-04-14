// src/pages/admin/ManageCourses.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses, deleteCourse, approveCourse } from '../../api/courses';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: ''
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    courseId: null,
    courseTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch courses based on pagination and filters
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        const { page, limit } = pagination;
        const { search, category, level } = filters;
        
        const query = {
          page,
          limit,
          ...(search && { search }),
          ...(category && { category }),
          ...(level && { level })
        };
        
        const response = await getAllCourses(query);
        
        setCourses(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    // The filter changes already trigger the useEffect
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.limit)) return;
    
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Open delete confirmation modal
  const openDeleteModal = (courseId, courseTitle) => {
    setDeleteModal({
      isOpen: true,
      courseId,
      courseTitle
    });
  };

  // Handle course deletion
  const handleDeleteCourse = async () => {
    try {
      setIsDeleting(true);
      await deleteCourse(deleteModal.courseId);
      
      // Update local state by removing the deleted course
      setCourses(prev => prev.filter(course => course._id !== deleteModal.courseId));
      
      // Close modal and show success message
      setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' });
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Failed to delete course. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle course approval
  const handleApproveCourse = async (courseId) => {
    try {
      await approveCourse(courseId);
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course._id === courseId ? { ...course, isApproved: true } : course
      ));
      
      toast.success('Course approved successfully');
    } catch (err) {
      console.error('Error approving course:', err);
      toast.error('Failed to approve course. Please try again.');
    }
  };

  // Filter options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'UI/UX', label: 'UI/UX' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Business', label: 'Business' },
    { value: 'Other', label: 'Other' }
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
        
        <Link to="/admin/courses/create" className="btn btn-primary">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Course
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormInput
              name="search"
              placeholder="Search by title or author"
              value={filters.search}
              onChange={handleFilterChange}
            />
            
            <FormSelect
              name="category"
              options={categoryOptions}
              value={filters.category}
              onChange={handleFilterChange}
            />
            
            <FormSelect
              name="level"
              options={levelOptions}
              value={filters.level}
              onChange={handleFilterChange}
            />
            
            <div className="flex items-end">
              <Button type="submit" variant="primary">
                Search
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Courses List */}
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
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-600">No courses found matching your criteria.</p>
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
                    Author
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
                            Duration: {course.duration} weeks
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof course.author === 'object' 
                          ? `${course.author.firstName} ${course.author.lastName}`
                          : 'Unknown Author'
                        }
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
                      <div className="flex flex-col space-y-1">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Link 
                            to={`/admin/courses/${course._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <span>|</span>
                          <Link 
                            to={`/courses/${course._id}`}
                            className="text-green-600 hover:text-green-900"
                            target="_blank"
                          >
                            View
                          </Link>
                          <span>|</span>
                          <button
                            onClick={() => openDeleteModal(course._id, course.title)}
                            className="text-danger-600 hover:text-danger-900"
                          >
                            Delete
                          </button>
                        </div>
                        
                        {course.requiresApproval && !course.isApproved && (
                          <button
                            onClick={() => handleApproveCourse(course._id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && courses.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} courses
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' })}
        title="Delete Course"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCourse}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete the course <strong>{deleteModal.courseTitle}</strong>? This action cannot be undone.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          All course data, lessons, quizzes, and user enrollments will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default ManageCourses;