import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * AdminRoute component that requires admin role
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authorized
 * @returns {React.ReactElement} - Rendered component or redirect
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Redirect to dashboard if not admin
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;