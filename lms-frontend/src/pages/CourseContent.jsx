// src/pages/CourseContent.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCourse } from '../api/courses';
import { getCourseLessons } from '../api/lessons';
import { getCourseQuizzes } from '../api/quizzes';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons');

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);
        const courseData = await getCourse(courseId);
        setCourse(courseData);

        const [lessonData, quizData] = await Promise.all([
          getCourseLessons(courseId),
          getCourseQuizzes(courseId)
        ]);

        setLessons(lessonData);
        setQuizzes(quizData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course content:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId]);

  const calculateProgress = () => {
    if (!lessons.length) return 0;

    const completedLessons = lessons.filter(
      (lesson) => lesson.progress && lesson.progress.status === 'completed'
    );

    return Math.round((completedLessons.length / lessons.length) * 100);
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
          <h2 className="text-xl font-semibold mb-2">Error loading course</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/enrolled-courses')}
          >
            Back to My Courses
          </Button>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="mb-4">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="primary" onClick={() => navigate('/enrolled-courses')}>
            Back to My Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">{course.title}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{calculateProgress()}% Complete</span>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {course.category}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {course.level}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            {course.duration} weeks
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {['lessons', 'quizzes', 'certificate'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-1 text-sm font-medium ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'lessons' && (
          <LessonsTab lessons={lessons} courseId={courseId} />
        )}
        {activeTab === 'quizzes' && (
          <QuizzesTab quizzes={quizzes} courseId={courseId} />
        )}
        {activeTab === 'certificate' && (
          <CertificateTab progress={calculateProgress()} courseId={courseId} />
        )}
      </div>
    </div>
  );
};

// Lessons Tab Component
const LessonsTab = ({ lessons, courseId }) => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Course Lessons</h2>
    {lessons.length ? (
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = lesson.progress?.status === 'completed';
          const isLocked = index > 0 && lessons[index - 1].progress?.status !== 'completed';

          return (
            <div
              key={lesson._id}
              className={`p-4 border rounded-lg ${
                isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div
                    className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{lesson.title}</h3>
                    {lesson.contentType && (
                      <span className="text-xs text-gray-500">
                        {lesson.contentType.charAt(0).toUpperCase() + lesson.contentType.slice(1)} •{' '}
                        {lesson.requiredTimeToComplete} min
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {isLocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      <LockIcon /> Locked
                    </span>
                  ) : (
                    <Link
                      to={`/courses/${courseId}/lessons/${lesson._id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      {isCompleted ? 'Review' : 'Start'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-gray-600 text-center py-4">No lessons available for this course yet.</p>
    )}
  </div>
);

// Quizzes Tab Component
const QuizzesTab = ({ quizzes, courseId }) => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Course Quizzes</h2>
    {quizzes.length ? (
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-medium text-gray-900">{quiz.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {quiz.description || 'No description available'}
                </p>
                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                  <span>{quiz.questions.length} Questions</span>
                  <span>
                    {quiz.timeLimit > 0 ? `${quiz.timeLimit} min time limit` : 'No time limit'}
                  </span>
                  <span>Passing score: {quiz.passingScore}%</span>
                </div>
              </div>
              <Link
                to={`/courses/${courseId}/quizzes/${quiz._id}`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                {quiz.userScore ? 'Retake Quiz' : 'Start Quiz'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600 text-center py-4">No quizzes available for this course yet.</p>
    )}
  </div>
);

// Certificate Tab Component
const CertificateTab = ({ progress, courseId }) => (
  <div className="text-center py-8">
    <h2 className="text-lg font-semibold mb-4">Course Certificate</h2>
    {progress === 100 ? (
      <div>
        <div className="mb-4">
          <CheckBadgeIcon className="w-16 h-16 mx-auto text-primary-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Congratulations!</h3>
        <p className="text-gray-600 mb-6">
          You've completed all the course requirements. You can now download your certificate.
        </p>
        <Link
          to={`/courses/${courseId}/certificate`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          View Certificate
        </Link>
      </div>
    ) : (
      <div>
        <div className="mb-4">
          <CheckBadgeIcon className="w-16 h-16 mx-auto text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Certificate Not Available Yet</h3>
        <p className="text-gray-600 mb-4">Complete all lessons and quizzes to earn your certificate.</p>
        <div className="w-48 mx-auto bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-primary-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">{progress}% completed</p>
      </div>
    )}
  </div>
);

// Optional icons as components (or replace with appropriate imports)
const LockIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const CheckBadgeIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

export default CourseContent;
