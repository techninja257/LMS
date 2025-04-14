// src/pages/LessonView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLesson, completeLesson } from '../api/lessons';
import { getCourse } from '../api/courses';
import { getCourseLessons } from '../api/lessons';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        
        // Fetch lesson, course, and all lessons in parallel
        const [lessonData, courseData, lessonsData] = await Promise.all([
          getLesson(lessonId),
          getCourse(courseId),
          getCourseLessons(courseId)
        ]);
        
        setLesson(lessonData);
        setCourse(courseData);
        setAllLessons(lessonsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [courseId, lessonId]);

  // Find current lesson index and get next/previous lessons
  const currentIndex = allLessons.findIndex(l => l._id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Handle marking lesson as complete
  const handleMarkComplete = async () => {
    try {
      setMarkingComplete(true);
      await completeLesson(lessonId);
      
      // Update the local lesson object to reflect completion
      setLesson(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          status: 'completed',
          completionDate: new Date().toISOString()
        }
      }));
      
      setMarkingComplete(false);
      
      // If there's a next lesson, navigate to it
      if (nextLesson) {
        navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
      }
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-danger-50 text-danger-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Error loading lesson</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => navigate(`/courses/${courseId}/content`)}
          >
            Back to Course
          </Button>
        </Card>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="mb-4">The lesson you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate(`/courses/${courseId}/content`)}
          >
            Back to Course
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Lesson Header */}
      <div className="mb-6">
        <Link 
          to={`/courses/${courseId}/content`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Course
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {lesson.title}
        </h1>
        
        <div className="flex flex-wrap items-center text-sm text-gray-600 mb-4 gap-4">
          <span>
            Lesson {currentIndex + 1} of {allLessons.length}
          </span>
          {lesson.contentType && (
            <span className="capitalize">
              Type: {lesson.contentType}
            </span>
          )}
          {lesson.requiredTimeToComplete && (
            <span>
              Estimated time: {lesson.requiredTimeToComplete} min
            </span>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <Card className="mb-8">
        {lesson.contentType === 'video' && lesson.video && lesson.video.url ? (
          <div className="mb-4">
            <div className="relative pb-16:9 h-0 overflow-hidden rounded-t-lg">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={lesson.video.url}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ) : lesson.contentType === 'pdf' && lesson.pdf && lesson.pdf.url ? (
          <div className="mb-4">
            <iframe
              src={`${lesson.pdf.url}#view=FitH`}
              className="w-full h-96 border-0"
              title={lesson.title}
            ></iframe>
          </div>
        ) : null}
        
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      </Card>

      {/* Navigation and Completion */}
      <div className="flex justify-between items-center">
        <div>
          {previousLesson && (
            <Link
              to={`/courses/${courseId}/lessons/${previousLesson._id}`}
              className="btn btn-secondary"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Lesson
            </Link>
          )}
        </div>
        
        <div className="flex space-x-4">
          {lesson.progress && lesson.progress.status === 'completed' ? (
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md">
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          ) : (
            <Button
              variant="primary"
              onClick={handleMarkComplete}
              isLoading={markingComplete}
              disabled={markingComplete}
            >
              Mark as Complete
            </Button>
          )}
          
          {nextLesson && (
            <Link
              to={`/courses/${courseId}/lessons/${nextLesson._id}`}
              className="btn btn-primary"
            >
              Next Lesson
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;