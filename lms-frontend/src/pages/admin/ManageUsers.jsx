import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser, resetUserPassword } from '../../api/user';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import FormSelect from '../../components/common/FormSelect';
import { getUsers } from '../../api/user';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newPasswordModal, setNewPasswordModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    newPassword: ''
  });

  // Fetch users based on current pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const { page, limit } = pagination;
        const { search, role } = filters;
        
        const query = {
          page,
          limit,
          ...(search && { search }),
          ...(role && { role })
        };
        
        const response = await getAllUsers(query);
        
        setUsers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [pagination.page, pagination.limit, filters]);

  // Handle search and filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    // The filter changes already trigger the useEffect
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.limit)) return;
    
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Open delete confirmation modal
  const openDeleteModal = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName
    });
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      setIsDeleting(true);
      await deleteUser(deleteModal.userId);
      
      // Update local state by removing the deleted user
      setUsers(prev => prev.filter(user => user._id !== deleteModal.userId));
      
      // Close modal and show success message
      setDeleteModal({ isOpen: false, userId: null, userName: '' });
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open password reset modal
  const openResetPasswordModal = (userId, userName) => {
    setNewPasswordModal({
      isOpen: true,
      userId,
      userName,
      newPassword: ''
    });
  };

  // Handle password reset
  const handleResetPassword = async () => {
    try {
      setIsResetting(true);
      const result = await resetUserPassword(newPasswordModal.userId);
      
      // Update modal with new password
      setNewPasswordModal(prev => ({
        ...prev,
        newPassword: result.newPassword
      }));
      
      toast.success('Password reset successfully');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  // Role options for filter
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'student', label: 'Student' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        
        <Link to="/admin/users/create" className="btn btn-primary">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              name="search"
              placeholder="Search by name or email"
              value={filters.search}
              onChange={handleFilterChange}
            />
            
            <FormSelect
              name="role"
              options={roleOptions}
              value={filters.role}
              onChange={handleFilterChange}
            />
            
            <div className="flex items-end">
              <Button type="submit" variant="primary">
                Search
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Users List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-md">
            <h3 className="font-medium">Error loading users</h3>
            <p>{error.message || 'An unexpected error occurred.'}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-600">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={user.profileImage || '/assets/images/default-profile.jpg'} 
                            alt={user.firstName} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role === 'instructor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openResetPasswordModal(user._id, `${user.firstName} ${user.lastName}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Reset Password
                        </button>
                        <span>|</span>
                        <Link 
                          to={`/admin/users/${user._id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </Link>
                        <span>|</span>
                        <button
                          onClick={() => openDeleteModal(user._id, `${user.firstName} ${user.lastName}`)}
                          className="text-danger-600 hover:text-danger-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
        title="Delete User"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete the user <strong>{deleteModal.userName}</strong>? This action cannot be undone.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          All user data, enrollments, and progress will be permanently removed.
        </p>
      </Modal>
      
      {/* Password Reset Modal */}
      <Modal
        isOpen={newPasswordModal.isOpen}
        onClose={() => setNewPasswordModal({ isOpen: false, userId: null, userName: '', newPassword: '' })}
        title="Reset User Password"
        footer={
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setNewPasswordModal({ isOpen: false, userId: null, userName: '', newPassword: '' })}
            >
              Close
            </Button>
            {!newPasswordModal.newPassword && (
              <Button
                variant="primary"
                onClick={handleResetPassword}
                isLoading={isResetting}
                disabled={isResetting}
              >
                Reset Password
              </Button>
            )}
          </div>
        }
      >
        {newPasswordModal.newPassword ? (
          <div>
            <p className="mb-4">
              Password for <strong>{newPasswordModal.userName}</strong> has been reset successfully.
            </p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Temporary Password:</p>
              <p className="font-mono bg-white p-2 border rounded text-center">{newPasswordModal.newPassword}</p>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Please share this password with the user. They will be required to change it on their next login.
            </p>
          </div>
        ) : (
          <div>
            <p>
              Are you sure you want to reset the password for <strong>{newPasswordModal.userName}</strong>?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              A new temporary password will be generated. The user will need to change it after logging in.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;