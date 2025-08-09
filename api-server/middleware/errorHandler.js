const { logger } = require('../services/logger');

// Custom error classes
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    name: error.name,
    method: req.method,
    url: req.url,
    userId: req.user?.id || 'anonymous',
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: error.message,
      field: error.field,
      type: 'validation_error'
    });
  }

  if (error.name === 'AuthenticationError') {
    return res.status(401).json({
      error: error.message,
      type: 'authentication_error'
    });
  }

  if (error.name === 'AuthorizationError') {
    return res.status(403).json({
      error: error.message,
      type: 'authorization_error'
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: error.message,
      type: 'not_found_error'
    });
  }

  if (error.name === 'DatabaseError') {
    return res.status(500).json({
      error: 'Database operation failed',
      type: 'database_error'
    });
  }

  // Handle JWT errors
  if (error.message === 'Invalid access token' || error.message === 'Invalid refresh token') {
    return res.status(401).json({
      error: 'Invalid or expired token',
      type: 'token_error'
    });
  }

  // Handle rate limiting errors
  if (error.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      type: 'rate_limit_error'
    });
  }

  // Handle database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Database connection failed',
      type: 'database_connection_error'
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  res.status(statusCode).json({
    error: message,
    type: 'internal_error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new ValidationError(error.details[0].message, error.details[0].path[0]);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
  validateRequest,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError
}; 