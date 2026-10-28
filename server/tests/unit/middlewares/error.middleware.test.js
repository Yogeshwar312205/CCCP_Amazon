const errorHandler = require('../../../src/middlewares/error.middleware');
const AppError = require('../../../src/utils/AppError');

// Silence logger during tests
jest.mock('../../../config/logger', () => ({
  error: jest.fn(),
  info:  jest.fn(),
  warn:  jest.fn(),
  debug: jest.fn(),
}));

const mockReq = (path = '/test', method = 'GET') => ({ path, method });

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler middleware', () => {
  const next = jest.fn();

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  test('handles AppError with correct statusCode and code', () => {
    const res = mockRes();
    const err = new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toBe('Product not found');
    expect(body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  test('defaults to 500 for unknown errors', () => {
    const res = mockRes();
    const err = new Error('Unknown failure');

    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  test('handles Sequelize UniqueConstraintError', () => {
    const res = mockRes();
    const err = {
      name: 'SequelizeUniqueConstraintError',
      message: 'Validation error',
      errors: [{ path: 'email', message: 'email must be unique' }],
    };

    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details[0].field).toBe('email');
  });

  test('handles SequelizeValidationError', () => {
    const res = mockRes();
    const err = {
      name: 'SequelizeValidationError',
      errors: [{ path: 'title', message: 'title cannot be null' }],
    };

    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  test('handles expired JWT token', () => {
    const res = mockRes();
    const err = { name: 'TokenExpiredError', message: 'jwt expired' };

    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('INVALID_TOKEN');
    expect(body.message).toContain('expired');
  });

  test('handles invalid JWT token', () => {
    const res = mockRes();
    const err = { name: 'JsonWebTokenError', message: 'invalid token' };

    errorHandler(err, mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('INVALID_TOKEN');
  });
});
