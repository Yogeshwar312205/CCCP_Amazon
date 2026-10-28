/**
 * Auth API integration tests.
 * Mocks the AuthService so no real DB connection is needed.
 * Tests the full HTTP request → middleware → controller → response cycle.
 */

const request = require('supertest');

// ---- Mock env and logger before app loads ----
jest.mock('../../config/logger', () => ({
  error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn(),
}));
jest.mock('../../config/env', () => ({
  PORT: '5000',
  NODE_ENV: 'test',
  JWT_SECRET: 'test_secret_key_min_16chars',
  JWT_EXPIRES_IN: '1h',
  CORS_ORIGIN: 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX: '1000',
  ENABLE_RATE_LIMIT: 'false',
}));

// ---- Mock Sequelize so the DB sync on app load is skipped ----
jest.mock('../../src/models', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync:         jest.fn().mockResolvedValue(),
    getDialect:   jest.fn().mockReturnValue('mysql'),
  },
}));

// ---- Mock AuthService ----
const mockRegister = jest.fn();
const mockLogin    = jest.fn();
jest.mock('../../src/services/auth.service', () => ({
  registerUser: (...a) => mockRegister(...a),
  loginUser:    (...a) => mockLogin(...a),
  generateToken: jest.fn().mockReturnValue('mock_token'),
}));

// ---- Rate limiter: disable for tests ----
jest.mock('../../src/middlewares/rateLimiter.middleware', () => ({
  globalLimiter: (req, res, next) => next(),
  authLimiter:   (req, res, next) => next(),
}));

const app = require('../../server');

// ---- Helpers ----
const validRegisterBody = {
  firstName: 'John',
  lastName:  'Doe',
  email:     'john@example.com',
  password:  'Password123!',
  phone:     '+1234567890',
};

const mockUserResponse = {
  data: {
    user:  { id: 1, email: 'john@example.com', role: 'CUSTOMER' },
    token: 'mock_token',
  },
};

// =========================================================
describe('POST /api/v1/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 - registers successfully with valid body', async () => {
    mockRegister.mockResolvedValue(mockUserResponse.data);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('mock_token');
  });

  test('400 - fails Zod validation when email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 - fails when password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegisterBody, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('400 - fails when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'john@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('409 - returns EMAIL_EXISTS error from service', async () => {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    mockRegister.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validRegisterBody);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });
});

// =========================================================
describe('POST /api/v1/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - returns token on valid credentials', async () => {
    mockLogin.mockResolvedValue(mockUserResponse.data);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test('400 - fails Zod validation with empty password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@example.com', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('401 - returns INVALID_CREDENTIALS from service', async () => {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    mockLogin.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'john@example.com', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

// =========================================================
describe('GET /api/v1/auth/me', () => {
  test('401 - returns UNAUTHORIZED with no token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('401 - returns error for malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.valid.token');

    expect(res.status).toBe(401);
  });
});

// =========================================================
describe('GET /api/v1/health', () => {
  test('health endpoint responds with status and database info', async () => {
    const res = await request(app).get('/api/v1/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('database');
  }, 5000);
});
