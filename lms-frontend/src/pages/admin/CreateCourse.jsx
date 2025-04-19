import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { createCourse } from '../../api/courses';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  const initialValues = {
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    isFree: false,
    isPremium: false,
    isPublished: true, // Admins can publish directly
    thumbnail: null,
    language: 'English',
    duration: '',
    prerequisites: [''],
    learningObjectives: [''],
    modules: [
      {
        title: '',
        description: '',
        lessons: [
          {
            title: '',
            type: 'video',
            content: '',
            duration: 0,
            isPreview: false
          }
        ]
      }
    ]
  };

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .max(100, 'Title must be less than 100 characters'),
    description: Yup.string()
      .required('Description is required'),
    category: Yup.string()
      .required('Category is required'),
    level: Yup.string()
      .required('Level is required')
      .oneOf(['beginner', 'intermediate', 'advanced'], 'Invalid level'),
    price: Yup.number()
      .min(0, 'Price cannot be negative')
      .when('isFree', {
        is: true,
        then: Yup.number().oneOf([0], 'Price must be 0 for free courses')
      }),
    language: Yup.string().required('Language is required'),
    duration: Yup.number()
      .required('Duration is required')
      .min(1, 'Duration must be at least 1 week')
      .integer('Duration must be a whole number'),
    prerequisites: Yup.array().of(Yup.string().required('Prerequisite cannot be empty')),
    learningObjectives: Yup.array().of(Yup.string().required('Learning objective cannot be empty')),
    modules: Yup.array().of(
      Yup.object({
        title: Yup.string().required('Module title is required'),
        lessons: Yup.array().of(
          Yup.object({
            title: Yup.string().required('Lesson title is required'),
            type: Yup.string().required('Lesson type is required')
          })
        ).min(1, 'At least one lesson is required')
      })
    ).min(1, 'At least one module is required')
  });

  const handleThumbnailChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('thumbnail', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Log values for debugging
      console.log('Form values:', values);
      
      // Add all text fields
      Object.keys(values).forEach(key => {
        if (key !== 'thumbnail' && key !== 'modules' && key !== 'prerequisites' && key !== 'learningObjectives') {
          formData.append(key, values[key]);
        }
      });
      
      // Add arrays as JSON strings
      formData.append('modules', JSON.stringify(values.modules));
      formData.append('prerequisites', JSON.stringify(values.prerequisites));
      formData.append('learningObjectives', JSON.stringify(values.learningObjectives));
      
      // Add thumbnail if exists
      if (values.thumbnail) {
        formData.append('thumbnail', values.thumbnail);
      }
      
      // Log FormData entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} = ${value}`);
      }
      
      // Call API to create course
      const response = await createCourse(formData);
      
      // Success message
      toast.success('Course created successfully!');
      
      // Redirect to admin courses
      navigate('/admin/courses');
    } catch (err) {
      setError(err.message || 'Failed to create course. Please try again.');
      console.error('Error creating course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    'Web Development',
    'Mobile Development',
    'UI/UX',
    'Data Science',
    'Business',
    'Other'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link 
          to="/admin/courses"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mr-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isValid, dirty, setFieldValue }) => (
          <Form className="space-y-8">
            {/* Basic Information */}
            <Card title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <Field
                    type="text"
                    name="title"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g., Complete Web Development Bootcamp"
                  />
                  <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About this Course *
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows="6"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Detailed description of your course (supports markdown)"
                  />
                  <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <Field
                    as="select"
                    name="category"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level *
                  </label>
                  <Field
                    as="select"
                    name="level"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Field>
                  <ErrorMessage name="level" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language *
                  </label>
                  <Field
                    type="text"
                    name="language"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g., English"
                  />
                  <ErrorMessage name="language" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (weeks) *
                  </label>
                  <Field
                    type="number"
                    name="duration"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="e.g., 4"
                    min="1"
                    step="1"
                  />
                  <ErrorMessage name="duration" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Field
                      type="number"
                      name="price"
                      className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={values.isFree}
                    />
                  </div>
                  <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div className="flex items-center space-x-6 md:col-span-2">
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      name="isFree"
                      id="isFree"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFieldValue('isFree', checked);
                        if (checked) {
                          setFieldValue('price', 0);
                        }
                      }}
                    />
                    <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
                      Free Course
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      name="isPremium"
                      id="isPremium"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-700">
                      Premium Course
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      name="isPublished"
                      id="isPublished"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                      Published
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Thumbnail
                  </label>
                  <div className="mt-1 flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="h-32 w-56 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-32 w-56 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                          <FaImage className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Choose file
                        <input
                          id="thumbnail-upload"
                          name="thumbnail"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => handleThumbnailChange(e, setFieldValue)}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: 1280x720px (16:9 ratio), JPG, PNG or GIF
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Prerequisites & Learning Objectives */}
            <Card title="Prerequisites & Learning Objectives">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prerequisites (What should students know before taking this course?)
                  </label>
                  <FieldArray name="prerequisites">
                    {({ remove, push }) => (
                      <div className="space-y-2">
                        {values.prerequisites.map((prerequisite, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex-grow">
                              <Field
                                name={`prerequisites.${index}`}
                                type="text"
                                placeholder="e.g., Basic JavaScript knowledge"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              />
                              <ErrorMessage
                                name={`prerequisites.${index}`}
                                component="div"
                                className="mt-1 text-sm text-red-600"
                              />
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => remove(index)}
                              disabled={values.prerequisites.length === 1}
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          onClick={() => push('')}
                        >
                          <FaPlus className="mr-2 h-4 w-4" />
                          Add Prerequisite
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Objectives (What will students learn in this course?)
                  </label>
                  <FieldArray name="learningObjectives">
                    {({ remove, push }) => (
                      <div className="space-y-2">
                        {values.learningObjectives.map((objective, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="flex-grow">
                              <Field
                                name={`learningObjectives.${index}`}
                                type="text"
                                placeholder="e.g., Build responsive websites using HTML, CSS and JavaScript"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              />
                              <ErrorMessage
                                name={`learningObjectives.${index}`}
                                component="div"
                                className="mt-1 text-sm text-red-600"
                              />
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => remove(index)}
                              disabled={values.learningObjectives.length === 1}
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          onClick={() => push('')}
                        >
                          <FaPlus className="mr-2 h-4 w-4" />
                          Add Learning Objective
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
            </Card>
            
            {/* Course Curriculum */}
            <Card title="Course Curriculum">
              <FieldArray name="modules">
                {({ remove: removeModule, push: pushModule }) => (
                  <div className="space-y-6">
                    {values.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Module {moduleIndex + 1}</h3>
                          <button
                            type="button"
                            className="inline-flex items-center p-1.5 border border-transparent rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => removeModule(moduleIndex)}
                            disabled={values.modules.length === 1}
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Module Title *
                            </label>
                            <Field
                              name={`modules.${moduleIndex}.title`}
                              type="text"
                              placeholder="e.g., Introduction to HTML"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            <ErrorMessage
                              name={`modules.${moduleIndex}.title`}
                              component="div"
                              className="mt-1 text-sm text-red-600"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Module Description
                            </label>
                            <Field
                              as="textarea"
                              name={`modules.${moduleIndex}.description`}
                              rows="2"
                              placeholder="Brief description of this module"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-md font-medium mb-2">Lessons</h4>
                          <FieldArray name={`modules.${moduleIndex}.lessons`}>
                            {({ remove: removeLesson, push: pushLesson }) => (
                              <div className="space-y-4">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div key={lessonIndex} className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex justify-between items-center mb-3">
                                      <h5 className="text-sm font-medium">Lesson {lessonIndex + 1}</h5>
                                      <button
                                        type="button"
                                        className="inline-flex items-center p-1 border border-transparent rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        onClick={() => removeLesson(lessonIndex)}
                                        disabled={module.lessons.length === 1}
                                      >
                                        <FaTrash className="h-3 w-3" />
                                      </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                      <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Lesson Title *
                                        </label>
                                        <Field
                                          name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                                          type="text"
                                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                        />
                                        <ErrorMessage
                                          name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                                          component="div"
                                          className="mt-1 text-xs text-red-600"
                                        />
                                      </div>
                                      
                                      <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Type *
                                        </label>
                                        <Field
                                          as="select"
                                          name={`modules.${moduleIndex}.lessons.${lessonIndex}.type`}
                                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                        >
                                          <option value="video">Video</option>
                                          <option value="text">Text</option>
                                          <option value="quiz">Quiz</option>
                                          <option value="assignment">Assignment</option>
                                        </Field>
                                      </div>
                                      
                                      <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Preview?
                                        </label>
                                        <div className="mt-2 h-5 flex items-center">
                                          <Field
                                            type="checkbox"
                                            name={`modules.${moduleIndex}.lessons.${lessonIndex}.isPreview`}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                  onClick={() => pushLesson({
                                    title: '',
                                    type: 'video',
                                    content: '',
                                    duration: 0,
                                    isPreview: false
                                  })}
                                >
                                  <FaPlus className="mr-1 h-3 w-3" />
                                  Add Lesson
                                </button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => pushModule({
                        title: '',
                        description: '',
                        lessons: [{ title: '', type: 'video', content: '', duration: 0, isPreview: false }]
                      })}
                    >
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Module
                    </button>
                  </div>
                )}
              </FieldArray>
            </Card>
            
            {/* Submission Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/courses')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="success"
                disabled={!(isValid && dirty) || isSubmitting}
                isLoading={isSubmitting}
              >
                Create Course
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateCourse;