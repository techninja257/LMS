const express = require('express');
const {
  verifyCertificate
} = require('../controllers/certificateController');

const router = express.Router();

// Public route to verify a certificate
router.get('/verify/:userId/:courseId', verifyCertificate);

module.exports = router;