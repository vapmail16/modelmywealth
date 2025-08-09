const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const rateLimiters = require('../middleware/rateLimiter');

// Public routes
router.post('/register', rateLimiters.registration, authController.register);
router.post('/login', rateLimiters.login, authController.login);
router.post('/verify-email', rateLimiters.emailVerification, authController.verifyEmail);
router.post('/forgot-password', rateLimiters.passwordReset, authController.forgotPassword);
router.post('/reset-password', rateLimiters.passwordReset, authController.resetPassword);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', authenticateUser, authController.logout);
router.get('/profile', authenticateUser, authController.getUserProfile);
router.put('/profile', authenticateUser, authController.updateUserProfile);

module.exports = router; 