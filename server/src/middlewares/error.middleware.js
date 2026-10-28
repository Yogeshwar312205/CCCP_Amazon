const logger = require('../../config/logger');

/**
 * Global error handler middleware.
 * Handles AppError, Sequelize validation errors, JWT errors, and unknown errors.
 * Must be registered LAST in Express middleware chain.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log every error with context
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
    code: err.code,
    statusCode: err.statusCode,
    stack: isDev ? err.stack : undefined,
  });

  // --- Sequelize Validation Error (e.g. unique constraint) ---
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const details = err.errors?.map((e) => ({ field: e.path, message: e.message })) || [];
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: { code: 'VALIDATION_ERROR', details },
    });
  }

  // --- JWT errors ---
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
      error: { code: 'INVALID_TOKEN' },
    });
  }

  // --- AppError or manually-shaped errors from services ---
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(isDev && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
