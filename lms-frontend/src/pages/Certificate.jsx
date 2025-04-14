// src/pages/Certificate.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { generateCertificate } from '../api/courses';
import { getCourse } from '../api/courses';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseAndCertificate = async () => {
      try {
        setLoading(true);
        
        // Get course details
        const courseData = await getCourse(courseId);
        setCourse(courseData);
        
        // Check if certificate already exists
        const enrollment = courseData.enrollments && courseData.enrollments[0];
        if (enrollment && enrollment.certificateUrl) {
          setCertificateUrl(enrollment.certificateUrl);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchCourseAndCertificate();
  }, [courseId]);

  // Generate certificate if not already available
  const handleGenerateCertificate = async () => {
    try {
      setGenerating(true);
      const result = await generateCertificate(courseId);
      setCertificateUrl(result.certificateUrl);
      setGenerating(false);
    } catch (err) {
      console.error('Error generating certificate:', err);
      setError(err);
      setGenerating(false);
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
          <h2 className="text-xl font-semibold mb-2">Error loading certificate</h2>
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

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="mb-4">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/enrolled-courses')}
          >
            My Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/courses/${courseId}/content`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Course
        </Link>
      </div>

      <Card>
        <div className="text-center py-6">
        // src/pages/Certificate.jsx (continued)
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Course Completion Certificate
          </h1>
          
          <p className="text-gray-600 mb-6">
            {certificateUrl 
              ? 'Congratulations on completing the course!' 
              : 'Generate your certificate for completing this course.'}
          </p>
          
          {certificateUrl ? (
            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <iframe
                  src={certificateUrl}
                  className="w-full h-96 border-0"
                  title="Course Certificate"
                ></iframe>
              </div>
              
              <a 
                href={certificateUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Certificate
              </a>
            </div>
          ) : (
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-gray-600 mb-4">
                  Your certificate will appear here after generation.
                </p>
                <Button
                  variant="primary"
                  onClick={handleGenerateCertificate}
                  isLoading={generating}
                  disabled={generating}
                >
                  Generate Certificate
                </Button>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Course Details</h3>
            <p className="text-gray-600">
              <strong>Course:</strong> {course.title}
            </p>
            <p className="text-gray-600">
              <strong>Category:</strong> {course.category}
            </p>
            <p className="text-gray-600">
              <strong>Level:</strong> {course.level}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Certificate;