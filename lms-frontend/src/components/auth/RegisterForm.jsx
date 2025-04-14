import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FaGoogle, FaGithub } from 'react-icons/fa';

import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { register } from '../../api/auth';

const RegisterForm = () => {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .trim()
      .required('First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: Yup.string()
      .trim()
      .required('Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      const { confirmPassword, ...registerData } = values;
      const response = await register(registerData);
      
      setRegisterSuccess(true);
      resetForm();
      // Navigate to verification page or login depending on your flow
      setTimeout(() => {
        navigate('/verify-email', { state: { email: values.email } });
      }, 2000);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login functionality
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };

  if (registerSuccess) {
    return (
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-semibold text-green-700 mb-2">Registration Successful!</h3>
        <p className="text-green-600">
          Please check your email to verify your account. You will be redirected shortly...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {serverError && <Alert type="error" message={serverError} className="mb-4" />}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, dirty }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="firstName"
                label="First Name"
                type="text"
                placeholder="John"
                required
              />
              <FormInput
                name="lastName"
                label="Last Name"
                type="text"
                placeholder="Doe"
                required
              />
            </div>

            <FormInput
              name="email"
              label="Email Address"
              type="email"
              placeholder="john.doe@example.com"
              required
            />

            <FormInput
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />

            <FormInput
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || !(isValid && dirty)}
              isLoading={isLoading}
            >
              Create Account
            </Button>

            <div className="relative flex items-center justify-center mt-4">
              <div className="border-t border-gray-300 absolute w-full"></div>
              <div className="bg-white px-4 relative text-sm text-gray-500">
                or continue with
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin('google')}
              >
                <FaGoogle className="text-red-500" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin('github')}
              >
                <FaGithub className="text-gray-800" />
                GitHub
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;