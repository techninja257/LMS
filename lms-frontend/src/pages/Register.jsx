// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';

const Register = () => {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState('');

  // Form validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setRegisterError('');
        const { confirmPassword, ...registerData } = values;
        
        // Add default role
        registerData.role = 'student';
        
        const success = await register(registerData);
        
        if (success) {
          // Redirect will happen in the auth context
        }
      } catch (error) {
        console.error('Registration error:', error);
        setRegisterError(error.response?.data?.error || 'Registration failed, please try again.');
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
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <Card>
          {registerError && (
            <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-md">
              {registerError}
            </div>
          )}
          
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="firstName"
                name="firstName"
                type="text"
                label="First Name"
                placeholder="John"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && formik.errors.firstName}
                required
              />
              
              <FormInput
                id="lastName"
                name="lastName"
                type="text"
                label="Last Name"
                placeholder="Doe"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && formik.errors.lastName}
                required
              />
            </div>
            
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
            
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Create a password"
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
              placeholder="Confirm your password"
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
                Sign Up
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;