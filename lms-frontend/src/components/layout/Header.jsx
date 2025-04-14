import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserNotifications, getUnreadCount, markAllAsRead } from '../../api/notifications';
import { DEFAULT_PROFILE_IMAGE } from '../../config';

const Header = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Fetch unread notifications count
  useEffect(() => {
    if (user) {
      const fetchNotificationCount = async () => {
        try {
          const count = await getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      };

      fetchNotificationCount();
      // Set up interval to check for new notifications
      const interval = setInterval(fetchNotificationCount, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch notifications when dropdown is opened
  const handleNotificationClick = async () => {
    if (user && !showNotifications) {
      try {
        const notificationData = await getUserNotifications(10); // Get latest 10 notifications
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    setShowNotifications(!showNotifications);
    setShowUserMenu(false); // Close user menu if open
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation(); // Prevent closing the dropdown
    
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Handle user menu toggle
  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false); // Close notifications if open
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div>
            <Link to="/" className="text-2xl font-bold text-primary-600">
              LearnHub LMS
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link to="/" className="text-gray-700 hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-700 hover:text-primary-600">
                  Courses
                </Link>
              </li>
              {user && (
                <li>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={handleNotificationClick}
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                    aria-label="Notifications"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                      <div className="p-2 border-b flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div 
                              key={notification._id}
                              className={`p-3 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className={`w-2 h-2 rounded-full mt-2 mr-2 ${!notification.read ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                                <div>
                                  <h4 className="font-medium text-sm">{notification.title}</h4>
                                  <p className="text-sm text-gray-600">{notification.message}</p>
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">No notifications</div>
                        )}
                      </div>
                      <div className="p-2 border-t text-center">
                        <Link
                          to="/notifications"
                          className="text-sm text-primary-600 hover:text-primary-800"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-label="User menu"
                  >
                    <img
                      src={user.profileImage || DEFAULT_PROFILE_IMAGE}
                      alt={user.firstName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user.firstName} {user.lastName}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile
                        </Link>
                        
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Dashboard
                        </Link>
                        
                        {user.role === 'instructor' && (
                          <Link
                            to="/instructor/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Instructor Dashboard
                          </Link>
                        )}
                        
                        {user.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;