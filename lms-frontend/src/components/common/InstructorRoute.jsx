import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * InstructorRoute component that requires instructor or admin role
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authorized
 * @returns {React.ReactElement} - Rendered component or redirect
 */
const InstructorRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    // Redirect to dashboard if not instructor or admin
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default InstructorRoute;