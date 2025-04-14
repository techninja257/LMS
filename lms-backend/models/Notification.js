const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title'],
    trim: true,
    maxlength: [100, 'Notification title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a notification message'],
    maxlength: [500, 'Notification message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Course', 'Lesson', 'Quiz', 'User', 'System'],
      default: 'System'
    },
    id: {
      type: mongoose.Schema.ObjectId
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to improve query performance on user + read status
NotificationSchema.index({ user: 1, read: 1 });

// Mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = Date.now();
  return this.save();
};

// Static method to create notification for multiple users
NotificationSchema.statics.notifyMany = async function(userIds, notificationData) {
  const notifications = userIds.map(userId => ({
    user: userId,
    ...notificationData
  }));
  
  return this.insertMany(notifications);
};

module.exports = mongoose.model('Notification', NotificationSchema);