const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authenticateUser, authController.logout);
router.get('/profile', authenticateUser, authController.getUserProfile);
router.put('/profile', authenticateUser, authController.updateUserProfile);

module.exports = router; 