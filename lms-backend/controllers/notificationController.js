const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(req.query.limit ? parseInt(req.query.limit) : 50);
  
  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Get unread user notifications count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({ 
    user: req.user.id,
    read: false
  });
  
  res.status(200).json({
    success: true,
    data: {
      count
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this notification`, 401));
  }
  
  // Mark as read
  notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { 
      read: true,
      readAt: Date.now()
    },
    {
      new: true,
      runValidators: false
    }
  );
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { 
      user: req.user.id,
      read: false
    },
    {
      read: true,
      readAt: Date.now()
    }
  );
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User not authorized to delete this notification`, 401));
  }
  
  await notification.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = asyncHandler(async (req, res, next) => {
  // If sending to specific user
  if (req.body.user) {
    const notification = await Notification.create(req.body);
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } 
  // If sending to all users or a role
  else if (req.body.toAll || req.body.toRole) {
    const User = require('../models/User');
    
    // Get users based on criteria
    let query = {};
    if (req.body.toRole) {
      query.role = req.body.toRole;
    }
    
    const users = await User.find(query).select('_id');
    const userIds = users.map(user => user._id);
    
    // Create notification data
    const notificationData = {
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'info',
      relatedTo: req.body.relatedTo || {
        model: 'System',
        id: null
      }
    };
    
    // Create notifications for all users
    const result = await Notification.notifyMany(userIds, notificationData);
    
    res.status(201).json({
      success: true,
      count: result.length,
      data: {
        message: `Notification sent to ${result.length} users`
      }
    });
  } else {
    return next(new ErrorResponse('Please specify user, toAll, or toRole', 400));
  }
});