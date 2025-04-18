// src/pages/instructor/CreateLesson.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import FormTextarea from '../../components/common/FormTextarea';
import { getCourse } from '../../api/courses';
import { createLesson, uploadLessonMaterial } from '../../api/lessons';

const CreateLesson = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getCourse(courseId);
        setCourse(courseData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load course');
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Lesson title is required'),
    description: Yup.string().required('Lesson description is required'),
    contentType: Yup.string()
      .required('Lesson type is required')
      .oneOf(['video', 'text', 'pdf', 'mixed'], 'Invalid lesson type'),
    content: Yup.string().when('contentType', {
      is: (contentType) => ['text', 'mixed'].includes(contentType),
      then: () => Yup.string().required('Content is required for this lesson type'),
      otherwise: () => Yup.string().nullable(),
    }),
    requiredTimeToComplete: Yup.number()
      .min(0, 'Duration cannot be negative')
      .required('Duration is required'),
    pageCount: Yup.number().when('contentType', {
      is: (contentType) => contentType === 'pdf',
      then: () => Yup.number().min(1, 'Page count must be at least 1').required('Page count is required for PDF'),
      otherwise: () => Yup.number().nullable(),
    }),
    order: Yup.number().min(1, 'Order must be at least 1').nullable(),
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
          
          <h1 className="text-2xl font-bold text-gray-900">Create New Lesson</h1>
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
          
          <h1 className="text-2xl font-bold text-gray-900">Create New Lesson</h1>
        </div>
        
        <Card className="bg-danger-50 text-danger-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Error loading course</h2>
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
        
        <h1 className="text-2xl font-bold text-gray-900">Create New Lesson</h1>
      </div>
      
      {/* Course Info */}
      {course && (
        <Card className="mb-8">
          <div className="flex items-start">
            <img 
              src={course.thumbnailImage || '/assets/images/default-course.jpg'} 
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
          initialValues={{
            title: '',
            description: '',
            contentType: 'text',
            content: '',
            requiredTimeToComplete: 15,
            pageCount: 1,
            order: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            console.log('CreateLesson onSubmit:', values); // Debug log
            try {
              setSubmitting(true);
              const lessonData = {
                title: values.title,
                description: values.description,
                contentType: values.contentType,
                content: values.content,
                requiredTimeToComplete: values.requiredTimeToComplete,
                order: values.order || undefined,
                isPublished: false, // Hardcode to false for admin approval
              };
              const lesson = await createLesson(courseId, lessonData);
              if (file) {
                const fileMetadata = {};
                if (values.contentType === 'video') {
                  fileMetadata.duration = values.requiredTimeToComplete;
                } else if (values.contentType === 'pdf') {
                  fileMetadata.pageCount = values.pageCount || 1;
                }
                await uploadLessonMaterial(lesson._id, file, fileMetadata);
              }
              toast.success('Lesson created successfully!');
              navigate(`/instructor/courses/${courseId}/lessons`);
            } catch (err) {
              console.error('Error creating lesson:', err);
              toast.error(err.response?.data?.message || err.message || 'Failed to create lesson');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
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
                
                {/* Content based on contentType */}
                {['text', 'mixed'].includes(values.contentType) && (
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
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {filePreview ? (
                          <div className="flex flex-col items-center">
                            <img src={filePreview} alt="File preview" className="h-24 w-24 object-contain mb-2" />
                            <p className="text-sm text-gray-500">{file?.name}</p>
                          </div>
                        ) : (
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        <div className="flex justify-center text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                            <span>{file ? 'Change file' : 'Upload a file'}</span>
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
                    {values.contentType === 'pdf' && (
                      <div className="mt-2">
                        <FormInput
                          id="pageCount"
                          name="pageCount"
                          type="number"
                          label="Number of Pages"
                          min={1}
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
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
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                >
                  Create Lesson
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default CreateLesson;