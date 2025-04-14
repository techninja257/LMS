// src/pages/QuizAttempt.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuiz, submitQuizAttempt } from '../api/quizzes';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const QuizAttempt = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await getQuiz(quizId);
        setQuiz(quizData);
        
        // Initialize questions (potentially randomized)
        let questions = [...quizData.questions];
        if (quizData.randomizeQuestions) {
          questions = questions.sort(() => Math.random() - 0.5);
        }
        setCurrentQuestions(questions);
        
        // Initialize answers array with empty values
        setUserAnswers(new Array(questions.length).fill(''));
        
        // Initialize timer if there's a time limit
        if (quizData.timeLimit && quizData.timeLimit > 0) {
          setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !quizResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      // Clean up the timer
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizResult) {
      // Auto-submit when time is up
      handleSubmit();
    }
  }, [timeLeft, quizResult]);

  // Handle answer change
  const handleAnswerChange = (questionIndex, answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await submitQuizAttempt(quizId, userAnswers);
      setQuizResult(result);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err);
      setIsSubmitting(false);
    }
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
          <h2 className="text-xl font-semibold mb-2">Error loading quiz</h2>
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

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Quiz not found</h2>
          <p className="mb-4">The quiz you're looking for doesn't exist or you don't have access to it.</p>
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

  // If quiz result is available, show the results screen
  if (quizResult) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-6">
            <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-4 ${
              quizResult.passed 
                ? 'bg-green-100 text-green-600' 
                : 'bg-danger-100 text-danger-600'
            }`}>
              {quizResult.passed ? (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              {quizResult.passed ? 'Congratulations!' : 'Quiz Result'}
            </h2>
            
            <p className="text-xl mb-4">
              Your score: {quizResult.score} / {quizResult.maxScore} ({Math.round(quizResult.percentage)}%)
            </p>
            
            <p className={`text-lg mb-6 ${
              quizResult.passed 
                ? 'text-green-600' 
                : 'text-danger-600'
            }`}>
              {quizResult.passed 
                ? 'You passed the quiz!' 
                : `You didn't meet the passing score of ${quiz.passingScore}%.`}
            </p>
            
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate(`/courses/${courseId}/content`)}
              >
                Back to Course
              </Button>
              
              {!quizResult.passed && quiz.allowRetake && (
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Retake Quiz
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Quiz Header */}
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
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {quiz.title}
          </h1>
          
          {timeLeft !== null && (
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
              timeLeft < 60 
                ? 'bg-danger-100 text-danger-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              Time Left: {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        {quiz.description && (
          <p className="text-gray-600 mt-2">
            {quiz.description}
          </p>
        )}
        
        <div className="mt-2 text-sm text-gray-600">
          {currentQuestions.length} questions • {quiz.passingScore}% passing score
        </div>
      </div>

      {/* Quiz Questions */}
      <div className="space-y-8 mb-8">
        {currentQuestions.map((question, questionIndex) => (
          <Card key={questionIndex}>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {questionIndex + 1}. {question.questionText}
              </h3>
            </div>
            
            <div>
              {question.questionType === 'multiple-choice' && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        id={`q${questionIndex}-option${optionIndex}`}
                        name={`question-${questionIndex}`}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        checked={userAnswers[questionIndex] === option}
                        onChange={() => handleAnswerChange(questionIndex, option)}
                      />
                      <label
                        htmlFor={`q${questionIndex}-option${optionIndex}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.questionType === 'true-false' && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`q${questionIndex}-true`}
                      name={`question-${questionIndex}`}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={userAnswers[questionIndex] === true}
                      onChange={() => handleAnswerChange(questionIndex, true)}
                    />
                    <label
                      htmlFor={`q${questionIndex}-true`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      True
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`q${questionIndex}-false`}
                      name={`question-${questionIndex}`}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={userAnswers[questionIndex] === false}
                      onChange={() => handleAnswerChange(questionIndex, false)}
                    />
                    <label
                      htmlFor={`q${questionIndex}-false`}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      False
                    </label>
                  </div>
                </div>
              )}
              
              {question.questionType === 'fill-in-blank' && (
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your answer"
                    value={userAnswers[questionIndex] || ''}
                    onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

export default QuizAttempt;