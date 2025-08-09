const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    message: {
      error: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    'Too many API requests, please try again later.'
  ),

  // Authentication rate limiting (more strict)
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per 15 minutes
    'Too many authentication attempts, please try again later.'
  ),

  // Password reset rate limiting
  passwordReset: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3, // 3 attempts per hour
    'Too many password reset attempts, please try again later.'
  ),

  // Email verification rate limiting
  emailVerification: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    5, // 5 attempts per hour
    'Too many email verification attempts, please try again later.'
  ),

  // Registration rate limiting
  registration: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3, // 3 registrations per hour
    'Too many registration attempts, please try again later.'
  ),

  // Login rate limiting
  login: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    50, // 50 login attempts per 15 minutes (increased for testing)
    'Too many login attempts, please try again later.'
  ),
};

module.exports = rateLimiters; 