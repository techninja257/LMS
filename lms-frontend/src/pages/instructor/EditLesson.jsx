// src/pages/instructor/EditLesson.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUpload, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormTextarea from '../../components/common/FormTextarea';
import Modal from '../../components/common/Modal';
import { getCourse } from '../../api/courses';
import { getLesson, updateLesson, uploadLessonMaterial } from '../../api/lessons';

const EditLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch course and lesson data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course and lesson in parallel
        const [courseData, lessonData] = await Promise.all([
          getCourse(courseId),
          getLesson(lessonId)
        ]);
        
        setCourse(courseData);
        setLesson(lessonData);
        
        // Set initial form values from lesson data
        const formValues = {
          title: lessonData.title || '',
          description: lessonData.description || '',
          contentType: lessonData.contentType || 'text',
          content: lessonData.content || '',
          requiredTimeToComplete: lessonData.requiredTimeToComplete || 15,
          order: lessonData.order || '',
          isPublished: lessonData.isPublished || false,
          pageCount: lessonData.pdf?.pageCount || 1
        };
        
        setInitialValues(formValues);
        
        // Set file preview if video or PDF exists
        if (lessonData.contentType === 'video' && lessonData.video?.url) {
          setFilePreview('/assets/images/video-icon.png');
        } else if (lessonData.contentType === 'pdf' && lessonData.pdf?.url) {
          setFilePreview('/assets/images/pdf-icon.png');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load lesson data');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]);

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
      .required('Description is required'),
    contentType: Yup.string()
      .required('Content type is required')
      .oneOf(['text', 'video', 'pdf', 'mixed'], 'Invalid content type'),
    content: Yup.string()
      .when('contentType', {
        is: (val) => val === 'text' || val === 'mixed',
        then: Yup.string().required('Content is required for text lessons')
      }),
    requiredTimeToComplete: Yup.number()
      .required('Required time to complete is required')
      .min(1, 'Time must be at least 1 minute')
      .integer('Time must be a whole number'),
    order: Yup.number()
      .nullable()
      .integer('Order must be a whole number')
  });

  // Handle file change
  const handleFileChange = (e, setFieldValue) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type based on content type
    const contentType = document.getElementById('contentType').value;
    let isValidType = false;

    if (contentType === 'video' && selectedFile.type.startsWith('video/')) {
      isValidType = true;
    } else if (contentType === 'pdf' && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      isValidType = true;
    }

    if (!isValidType) {
      toast.error(`Invalid file type for ${contentType} content`);
      return;
    }

    setFile(selectedFile);
    
    // Create preview for PDF files
    if (contentType === 'pdf') {
      setFilePreview('/assets/images/pdf-icon.png');
    } 
    // Create preview for video files
    else if (contentType === 'video') {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(selectedFile);
      videoElement.onloadedmetadata = () => {
        // Update duration field if it's a video
        const durationInMinutes = Math.ceil(videoElement.duration / 60);
        setFieldValue('requiredTimeToComplete', durationInMinutes);
      };
      setFilePreview('/assets/images/video-icon.png');
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Update the lesson
      const lessonData = {
        title: values.title,
        description: values.description,
        contentType: values.contentType,
        content: values.content,
        requiredTimeToComplete: values.requiredTimeToComplete,
        order: values.order || undefined,
        isPublished: values.isPublished
      };
      
      // Update lesson details
      await updateLesson(lessonId, lessonData);
      
      // If there's a new file, upload it
      if (file) {
        setUploadProgress(10);
        const fileMetadata = {};
        
        // Add metadata based on file type
        if (values.contentType === 'video') {
          fileMetadata.duration = values.requiredTimeToComplete;
        } else if (values.contentType === 'pdf') {
          fileMetadata.pageCount = values.pageCount || 1;
        }
        
        // Simulate upload progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 500);
        
        await uploadLessonMaterial(lessonId, file, fileMetadata);
        clearInterval(progressInterval);
        setUploadProgress(100);
      }
      
      toast.success('Lesson updated successfully!');
      navigate(`/instructor/courses/${courseId}/lessons`);
    } catch (err) {
      console.error('Error updating lesson:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update lesson');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Handle content type change
  const handleContentTypeChange = (e, setFieldValue) => {
    const newContentType = e.target.value;
    setFieldValue('contentType', newContentType);
    
    // Reset file when changing content type
    setFile(null);
    setFilePreview(null);
    
    // Set appropriate preview for existing content
    if (lesson) {
      if (newContentType === 'video' && lesson.video?.url) {
        setFilePreview('/assets/images/video-icon.png');
      } else if (newContentType === 'pdf' && lesson.pdf?.url) {
        setFilePreview('/assets/images/pdf-icon.png');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            to={`/instructor/courses/${courseId}/lessons`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lessons
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Edit Lesson</h1>
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
            to={`/instructor/courses/${courseId}/lessons`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lessons
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Edit Lesson</h1>
        </div>
        
        <Card className="bg-danger-50 text-danger-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Error loading lesson</h2>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => navigate(`/instructor/courses/${courseId}/lessons`)}
          >
            Back to Lessons
          </Button>
        </Card>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            to={`/instructor/courses/${courseId}/lessons`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lessons
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Edit Lesson</h1>
        </div>
        
        <Card className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="mb-4">The lesson you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate(`/instructor/courses/${courseId}/lessons`)}
          >
            Back to Lessons
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link 
          to={`/instructor/courses/${courseId}/lessons`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Lessons
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900">Edit Lesson</h1>
      </div>
      
      {/* Course Info */}
      {course && (
        <Card className="mb-8">
          <div className="flex items-start">
            <img 
              src={course.coverImage || '/assets/images/default-course.jpg'} 
              alt={course.title}
              className="h-16 w-24 object-cover rounded mr-4"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span>{course.category}</span>
                <span className="mx-2">•</span>
                <span>{course.level}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Lesson Form */}
      <Card>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="space-y-6">
              {/* Warning message when changing content type */}
              {lesson && lesson.contentType !== values.contentType && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Changing content type will reset any previously uploaded files. You will need to upload a new file for the selected content type.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormInput
                    id="title"
                    name="title"
                    label="Lesson Title"
                    placeholder="Enter a descriptive title for your lesson"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <FormTextarea
                    id="description"
                    name="description"
                    label="Lesson Description"
                    placeholder="Provide a brief description of what students will learn in this lesson"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <FormSelect
                    id="contentType"
                    name="contentType"
                    label="Content Type"
                    options={[
                      { value: 'text', label: 'Text' },
                      { value: 'video', label: 'Video' },
                      { value: 'pdf', label: 'PDF' },
                      { value: 'mixed', label: 'Mixed Content' }
                    ]}
                    value={values.contentType}
                    onChange={(e) => handleContentTypeChange(e, setFieldValue)}
                    required
                  />
                </div>
                
                <div>
                  <FormInput
                    id="requiredTimeToComplete"
                    name="requiredTimeToComplete"
                    type="number"
                    label="Estimated Time to Complete (minutes)"
                    min={1}
                    required
                  />
                </div>
                
                <div>
                  <FormInput
                    id="order"
                    name="order"
                    type="number"
                    label="Order in Course (optional)"
                    helpText="Leave blank for automatic ordering"
                    min={1}
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center">
                    <Field
                      type="checkbox"
                      name="isPublished"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publish this lesson</span>
                  </label>
                </div>
                
                {/* Content based on contentType */}
                {(values.contentType === 'text' || values.contentType === 'mixed') && (
                  <div className="md:col-span-2">
                    <FormTextarea
                      id="content"
                      name="content"
                      label="Lesson Content"
                      placeholder="Enter your lesson content here. You can use Markdown formatting."
                      rows={10}
                      required
                    />
                  </div>
                )}
                
                {(values.contentType === 'video' || values.contentType === 'pdf') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {values.contentType === 'video' ? 'Upload Video' : 'Upload PDF'}
                    </label>
                    
                    {/* Current file info */}
                    {lesson && ((values.contentType === 'video' && lesson.video?.url) || 
                               (values.contentType === 'pdf' && lesson.pdf?.url)) && !file && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img 
                              src={values.contentType === 'video' ? '/assets/images/video-icon.png' : '/assets/images/pdf-icon.png'} 
                              alt="Current file" 
                              className="h-10 w-10"
                            />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              Current {values.contentType === 'video' ? 'Video' : 'PDF'} File
                            </p>
                            <p className="text-xs text-gray-500">
                              {values.contentType === 'video' && lesson.video?.duration && `${lesson.video.duration} minutes`}
                              {values.contentType === 'pdf' && lesson.pdf?.pageCount && `${lesson.pdf.pageCount} pages`}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Upload a new file to replace the current one
                        </p>
                      </div>
                    )}
                    
                    {/* File upload section */}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <img src={filePreview} alt="File preview" className="h-24 w-24 object-contain mb-2" />
                            <p className="text-sm text-gray-500">{file?.name || 'Current file'}</p>
                            
                            {/* Upload progress bar */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="w-full mt-2">
                                <div className="bg-gray-200 rounded-full h-2.5 w-44 mt-2">
                                  <div 
                                    className="bg-primary-600 h-2.5 rounded-full" 
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Uploading: {uploadProgress}%
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <div className="flex justify-center text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                            <span>{file || filePreview ? 'Change file' : 'Upload a file'}</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              accept={values.contentType === 'video' ? 'video/*' : 'application/pdf'}
                              onChange={(e) => handleFileChange(e, setFieldValue)}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          {values.contentType === 'video' 
                            ? 'MP4, WebM, or OGG up to 100MB' 
                            : 'PDF up to 20MB'}
                        </p>
                      </div>
                    </div>
                    
                    {/* PDF page count */}
                    {values.contentType === 'pdf' && (
                      <div className="mt-2">
                        <FormInput
                          id="pageCount"
                          name="pageCount"
                          type="number"
                          label="Number of Pages"
                          min={1}
                          helpText="Approximate number of pages in the PDF"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Form actions */}
              <div className="flex justify-between space-x-4 pt-4 border-t border-gray-200 mt-8">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Lesson
                </Button>
                
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/instructor/courses/${courseId}/lessons`)}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Update Lesson
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Lesson"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // Navigate back to lessons list
                // Actual deletion is handled in the ManageLessons component
                navigate(`/instructor/courses/${courseId}/lessons`);
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete this lesson? This action cannot be undone.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          All lesson content and student progress data for this lesson will be permanently removed.
        </p>
      </Modal>
    </div>
  );
};

export default EditLesson;