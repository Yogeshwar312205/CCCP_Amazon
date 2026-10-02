const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { User, Cart, Wishlist, sequelize } = require('../models');

class AuthService {
  static async registerUser(userData) {
    const transaction = await sequelize.transaction();
    try {
      const existingUser = await User.findOne({ where: { email: userData.email } }, { transaction });
      if (existingUser) {
        const error = new Error('Email address is already registered');
        error.statusCode = 409;
        error.code = 'EMAIL_EXISTS';
        throw error;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || null,
        password: hashedPassword,
        role: 'CUSTOMER',
        isActive: true,
      }, { transaction });

      // Automatically initialize empty Cart and Wishlist for new customer
      await Cart.create({ userId: user.id }, { transaction });
      await Wishlist.create({ userId: user.id }, { transaction });

      await transaction.commit();

      const token = this.generateToken(user);
      return { user: this.sanitizeUser(user), token };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async loginUser(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('User account has been deactivated. Please contact support.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_DEACTIVATED';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  static sanitizeUser(user) {
    const userJson = user.toJSON();
    delete userJson.password;
    return userJson;
  }
}

module.exports = AuthService;
