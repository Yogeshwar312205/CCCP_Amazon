const AuthService = require('../services/auth.service');

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginUser(email, password);
      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: 'User profile retrieved',
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
