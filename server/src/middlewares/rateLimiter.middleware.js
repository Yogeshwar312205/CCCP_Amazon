const rateLimit = require('express-rate-limit');
const env = require('../../config/env');

const isDevelopment = (env.NODE_ENV || process.env.NODE_ENV) === 'development';
const shouldSkip = () => isDevelopment && env.ENABLE_RATE_LIMIT !== 'true';

const globalLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default: 15 minutes
  max: parseInt(env.RATE_LIMIT_MAX || '1000', 10), // Default: 1000 requests per window
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    error: { code: 'TOO_MANY_REQUESTS' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDevelopment ? 50 : 10,
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a minute',
    error: { code: 'TOO_MANY_REQUESTS' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
};
