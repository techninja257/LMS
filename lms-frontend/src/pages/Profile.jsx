// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../api/user';
import { updateUserDetails, updatePassword } from '../api/auth';
import { uploadProfileImage } from '../api/user';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import FileUpload from '../components/common/FileUpload';
import { DEFAULT_PROFILE_IMAGE } from '../config';


const Profile = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  
  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const userData = await getUserProfile(user.id);
        
        setProfileData({
          firstName: userData.user.firstName || '',
          lastName: userData.user.lastName || '',
          email: userData.user.email || '',
          bio: userData.user.bio || ''
        });
        
        setImagePreview(userData.user.profileImage || DEFAULT_PROFILE_IMAGE);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Handle profile data changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle file selection for profile image
  const handleFileSelect = (file) => {
    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      // Update user details
      const updatedUser = await updateUserDetails({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio
      });
      
      // Update local user data in auth context
      updateUserData({
        firstName: updatedUser.data.firstName,
        lastName: updatedUser.data.lastName
      });
      
      toast.success('Profile updated successfully');
      setUpdating(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
      setUpdating(false);
    }
  };
  
  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully');
      setChangingPassword(false);
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error(err.response?.data?.error || 'Failed to change password');
      setChangingPassword(false);
    }
  };
  
  // Upload profile image
  const handleUploadImage = async () => {
    if (!profileImage) return;
    
    try {
      setUploadingImage(true);
      
      const response = await uploadProfileImage(user.id, profileImage);
      
      // Update auth context with new image
      updateUserData({
        profileImage: response.profileImage
      });
      
      toast.success('Profile image updated');
      setUploadingImage(false);
    } catch (err) {
      console.error('Error uploading profile image:', err);
      toast.error('Failed to upload profile image');
      setUploadingImage(false);
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
          <h2 className="text-xl font-semibold mb-2">Error loading profile</h2>
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Image Section */}
        <div className="md:col-span-1">
          <Card className="text-center p-6">
            <div className="mb-4">
              <img 
                src={imagePreview || DEFAULT_PROFILE_IMAGE} 
                alt={user?.firstName}
                className="w-32 h-32 rounded-full mx-auto object-cover"
              />
            </div>
            
            <h2 className="text-xl font-bold mb-1">
              {user?.firstName} {user?.lastName}
            </h2>
            
            <p className="text-gray-600 mb-4">{user?.email}</p>
            
            <p className="text-sm text-gray-500 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {user?.role}
              </span>
            </p>
            
            <div className="mt-6">
              <FileUpload
                id="profileImage"
                name="profileImage"
                label="Update Profile Picture"
                fileType="image"
                onFileSelect={handleFileSelect}
                previewUrl={imagePreview}
              />
              
              {profileImage && (
                <Button
                  variant="primary"
                  onClick={handleUploadImage}
                  isLoading={uploadingImage}
                  disabled={uploadingImage}
                  className="mt-2 w-full"
                >
                  Upload Image
                </Button>
              )}
            </div>
          </Card>
        </div>
        
        {/* Profile Details Section */}
        <div className="md:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormInput
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  required
                />
                
                <FormInput
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
                helpText="Email cannot be changed"
              />
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Tell us about yourself"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updating}
                  disabled={updating}
                >
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>
          
          <Card className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            
            <form onSubmit={handleChangePassword}>
              <FormInput
                id="currentPassword"
                name="currentPassword"
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              
              <FormInput
                id="newPassword"
                name="newPassword"
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                helpText="Password must be at least 6 characters"
              />
              
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={changingPassword}
                  disabled={changingPassword}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
          
          {/* Account Preferences (Optional) */}
          <Card className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Account Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email notifications about course updates and announcements</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="emailNotifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-900">
                    Enabled
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Use dark theme for the application</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="darkMode"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="darkMode" className="ml-2 text-sm text-gray-900">
                    Enabled
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button variant="secondary">
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;