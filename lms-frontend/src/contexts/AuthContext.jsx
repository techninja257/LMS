import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, register, logout, getCurrentUser, forgotPassword, resetPassword } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Token might be expired or invalid
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Login user
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const { token, user } = await login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Logged in successfully!');
      
      // Redirect based on user role
      redirectBasedOnRole(user.role);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed, please try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const { token, user } = await register(userData);
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Registered successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed, please try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      setLoading(true);
      if (token) {
        await logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data and token regardless of API response
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.info('Logged out successfully');
      navigate('/login');
      setLoading(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async (email) => {
    try {
      setLoading(true);
      await forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.error || 'Failed to send reset email, please try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      toast.success('Password reset successfully, please login');
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.error || 'Failed to reset password, please try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Redirect based on user role
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'instructor':
        navigate('/instructor/dashboard');
        break;
      case 'student':
      default:
        navigate('/dashboard');
        break;
    }
  };

  // Update user profile
  const updateUserData = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};