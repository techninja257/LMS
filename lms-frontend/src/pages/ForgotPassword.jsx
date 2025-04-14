// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { forgotPassword } from '../api/auth';
import Card from '../components/common/Card';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';

const ForgotPassword = () => {
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: '' });

  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitStatus({ success: false, error: '' });
        await forgotPassword(values.email);
        setSubmitStatus({
          success: true,
          error: ''
        });
      } catch (error) {
        console.error('Forgot password error:', error);
        setSubmitStatus({
          success: false,
          error: error.response?.data?.error || 'Failed to send reset email. Please try again.'
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card>
          {submitStatus.success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Reset Link Sent
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a password reset link to your email address.
                Please check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              {submitStatus.error && (
                <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-md">
                  {submitStatus.error}
                </div>
              )}

              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email}
                required
              />

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                >
                  Send Reset Link
                </Button>
              </div>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;