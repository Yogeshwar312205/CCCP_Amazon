/**
 * Custom application error class.
 * Replaces the scattered `const error = new Error(); error.statusCode = X` pattern
 * used across services with a single, consistent throw.
 *
 * Usage:
 *   throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (default 500)
   * @param {string} code - Machine-readable error code (default 'INTERNAL_ERROR')
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    // Capture stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
