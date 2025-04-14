const express = require('express');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/notificationController');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getUserNotifications)
  .post(authorize('admin'), createNotification);

router.get('/unread/count', getUnreadCount);
router.put('/read-all', markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

router.put('/:id/read', markAsRead);

module.exports = router;