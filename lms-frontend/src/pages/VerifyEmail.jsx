// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const VerifyEmail = () => {
  const { token } = useParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState({
    success: false,
    message: ''
  });

  useEffect(() => {
    const verify = async () => {
      try {
        setVerifying(true);
        await verifyEmail(token);
        setStatus({
          success: true,
          message: 'Your email has been successfully verified!'
        });
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus({
          success: false,
          message: error.response?.data?.error || 'Email verification failed. The link may be invalid or expired.'
        });
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verify();
    } else {
      setVerifying(false);
      setStatus({
        success: false,
        message: 'Invalid verification link.'
      });
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Email Verification
          </h1>
        </div>

        <Card>
          {verifying ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              {status.success ? (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email Verified
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {status.message}
                  </p>
                  <Link to="/login">
                    <Button variant="primary">
                      Go to Login
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 mb-4">
                    <svg className="h-6 w-6 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-danger-700 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {status.message}
                  </p>
                  <Link to="/login">
                    <Button variant="primary">
                      Go to Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;