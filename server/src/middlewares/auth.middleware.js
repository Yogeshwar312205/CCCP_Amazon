const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.',
        error: { code: 'UNAUTHORIZED' },
      });
    }

    req.user = user;
    next();
  } catch (_err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: { code: 'INVALID_TOKEN' },
    });
  }
};

module.exports = authenticate;
