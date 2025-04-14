const express = require('express');
const {
  generateCertificate
} = require('../controllers/certificateController');

// Include auth middleware
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Protected route
router.post('/', protect, generateCertificate);

module.exports = router;