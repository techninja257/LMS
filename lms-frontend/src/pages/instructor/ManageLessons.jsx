// src/pages/instructor/ManageLessons.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCourse } from '../../api/courses';
import { getCourseLessons, deleteLesson } from '../../api/lessons';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const ManageLessons = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    lessonId: null,
    lessonTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch course and lessons
  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        setLoading(true);
        
        // Fetch course and lessons in parallel
        const [courseData, lessonsData] = await Promise.all([
          getCourse(courseId),
          getCourseLessons(courseId)
        ]);
        
        setCourse(courseData);
        setLessons(lessonsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load course data');
        setLoading(false);
      }
    };
    
    fetchCourseAndLessons();
  }, [courseId]);

  // Open delete confirmation modal
  const openDeleteModal = (lessonId, lessonTitle) => {
    setDeleteModal({
      isOpen: true,
      lessonId,
      lessonTitle
    });
  };

  // Handle lesson deletion
  const handleDeleteLesson = async () => {
    try {
      setIsDeleting(true);
      
      await deleteLesson(deleteModal.lessonId);
      
      // Update the lessons state by removing the deleted lesson
      setLessons(prev => prev.filter(lesson => lesson._id !== deleteModal.lessonId));
      
      // Close the modal and show success message
      setDeleteModal({ isOpen: false, lessonId: null, lessonTitle: '' });
      toast.success('Lesson deleted successfully');
    } catch (err) {
      console.error('Error deleting lesson:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete lesson');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            to="/instructor/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
        </div>
        
        <div className="flex justify-center py-12">
          <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            to="/instructor/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
        </div>
        
        <Card className="bg-danger-50 text-danger-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Error loading course</h2>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => navigate('/instructor/courses')}
          >
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            to="/instructor/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
        </div>
        
        <Card className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="mb-4">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/instructor/courses')}
          >
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link 
            to="/instructor/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
        </div>
        
        <Link to={`/instructor/courses/${courseId}/lessons/create`}>
          <Button variant="primary">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Lesson
          </Button>
        </Link>
      </div>
      
      {/* Course Info Card */}
      <Card className="mb-8">
        <div className="flex items-start">
          <img 
            src={course.coverImage || '/assets/images/default-course.jpg'} 
            alt={course.title}
            className="h-20 w-32 object-cover rounded mr-4"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
      </Card>
      
      {/* Lessons List */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Course Lessons</h2>
        </div>
        
        {lessons.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No lessons yet</h3>
            <p className="text-gray-600 mb-4">You haven't created any lessons for this course yet.</p>
            <Link to={`/instructor/courses/${courseId}/lessons/create`}>
              <Button variant="primary">Create Your First Lesson</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {lessons.map((lesson, index) => (
              <li key={lesson._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 flex items-center justify-center rounded-full mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                      <span className="capitalize">{lesson.contentType || 'text'}</span>
                      {lesson.requiredTimeToComplete && (
                        <>
                          <span>•</span>
                          <span>{lesson.requiredTimeToComplete} min</span>
                        </>
                      )}
                      {lesson.order && (
                        <>
                          <span>•</span>
                          <span>Order: {lesson.order}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                  <div className="flex space-x-2">
                  <Link
                    to={`/instructor/courses/${courseId}/lessons/${lesson._id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(lesson._id, lesson.title)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/courses/${courseId}/lessons/${lesson._id}`}
                    target="_blank"
                    className="text-green-600 hover:text-green-900"
                  >
                    Preview
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      
      {/* Lesson Modules/Sections (optional) */}
      {course.modules && course.modules.length > 0 && (
        <Card className="mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Course Modules</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-lg font-medium mb-4">Module {moduleIndex + 1}: {module.title}</h3>
                  
                  {module.description && (
                    <p className="text-gray-600 mb-4">{module.description}</p>
                  )}
                  
                  {module.lessons && module.lessons.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <li key={lessonIndex} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-100 text-gray-600 flex items-center justify-center rounded-full mr-3 text-xs">
                              {lessonIndex + 1}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">{lesson.title}</h4>
                              <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                <span className="capitalize">{lesson.type}</span>
                                {lesson.duration > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{lesson.duration} min</span>
                                  </>
                                )}
                                {lesson.isPreview && (
                                  <>
                                    <span>•</span>
                                    <span className="text-primary-600">Preview</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No lessons in this module</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, lessonId: null, lessonTitle: '' })}
        title="Delete Lesson"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, lessonId: null, lessonTitle: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteLesson}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete the lesson <strong>{deleteModal.lessonTitle}</strong>? This action cannot be undone.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          All lesson content and student progress data for this lesson will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default ManageLessons;