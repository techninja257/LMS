// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const [resetError, setResetError] = useState('');

  // Form validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setResetError('');
        await resetPassword(token, values.password);
        // Navigation to login happens in the Auth Context
      } catch (error) {
        console.error('Password reset error:', error);
        setResetError(error.response?.data?.error || 'Failed to reset password. Please try again or request a new link.');
        setSubmitting(false);
      }
    }
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="text-center py-6">
            <h3 className="text-lg font-medium text-danger-700 mb-2">
              Invalid Reset Link
            </h3>
            <p className="text-gray-600 mb-4">
              The password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn btn-primary">
              Request a new link
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card>
          <form onSubmit={formik.handleSubmit}>
            {resetError && (
              <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-md">
                {resetError}
              </div>
            )}

            <FormInput
              id="password"
              name="password"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              required
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your new password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                Reset Password
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500">
                Back to login
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;