/**
 * Auth Service unit tests — mocks bcrypt, jwt, and Sequelize models.
 * No real database connection required.
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// ---- Mock dependencies BEFORE requiring the service ----
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../config/logger', () => ({
  error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn(),
}));

// Mock env config
jest.mock('../../../config/env', () => ({
  JWT_SECRET: 'test_secret_key_min_16chars',
  JWT_EXPIRES_IN: '1h',
}));

// Mock models
const mockUserCreate = jest.fn();
const mockUserFindOne = jest.fn();
const mockCartCreate = jest.fn();
const mockWishlistCreate = jest.fn();
const mockUserSave = jest.fn();
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  finished: false,
};

jest.mock('../../../src/models', () => ({
  User: {
    findOne: (...args) => mockUserFindOne(...args),
    create: (...args) => mockUserCreate(...args),
  },
  Cart: { create: (...args) => mockCartCreate(...args) },
  Wishlist: { create: (...args) => mockWishlistCreate(...args) },
  sequelize: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  },
}));

const AuthService = require('../../../src/services/auth.service');

// ---- Helper ----
const makeUser = (overrides = {}) => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed_password',
  role: 'CUSTOMER',
  isActive: true,
  lastLoginAt: null,
  save: mockUserSave,
  toJSON() { return { ...this }; },
  ...overrides,
});

describe('AuthService.generateToken()', () => {
  test('calls jwt.sign with user id, email, role', () => {
    jwt.sign.mockReturnValue('mock_token');
    const user = makeUser();
    const token = AuthService.generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 1, email: 'john@example.com', role: 'CUSTOMER' },
      'test_secret_key_min_16chars',
      { expiresIn: '1h' }
    );
    expect(token).toBe('mock_token');
  });
});

describe('AuthService.sanitizeUser()', () => {
  test('removes password from user object', () => {
    const user = makeUser({ password: 'secret123' });
    const sanitized = AuthService.sanitizeUser(user);

    expect(sanitized).not.toHaveProperty('password');
    expect(sanitized.email).toBe('john@example.com');
  });
});

describe('AuthService.loginUser()', () => {
  beforeEach(() => jest.clearAllMocks());

  test('throws INVALID_CREDENTIALS if user not found', async () => {
    mockUserFindOne.mockResolvedValue(null);

    await expect(AuthService.loginUser('x@x.com', 'pass'))
      .rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', statusCode: 401 });
  });

  test('throws ACCOUNT_DEACTIVATED if user is inactive', async () => {
    mockUserFindOne.mockResolvedValue(makeUser({ isActive: false }));

    await expect(AuthService.loginUser('john@example.com', 'pass'))
      .rejects.toMatchObject({ code: 'ACCOUNT_DEACTIVATED', statusCode: 403 });
  });

  test('throws INVALID_CREDENTIALS if password does not match', async () => {
    mockUserFindOne.mockResolvedValue(makeUser());
    bcrypt.compare.mockResolvedValue(false);

    await expect(AuthService.loginUser('john@example.com', 'wrong_pass'))
      .rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', statusCode: 401 });
  });

  test('returns user and token on successful login', async () => {
    const user = makeUser();
    mockUserFindOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    mockUserSave.mockResolvedValue();
    jwt.sign.mockReturnValue('valid_token');

    const result = await AuthService.loginUser('john@example.com', 'Password123!');

    expect(result.token).toBe('valid_token');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.email).toBe('john@example.com');
  });
});

describe('AuthService.registerUser()', () => {
  beforeEach(() => jest.clearAllMocks());

  test('throws EMAIL_EXISTS if email is already taken', async () => {
    mockUserFindOne.mockResolvedValue(makeUser());

    await expect(AuthService.registerUser({
      firstName: 'Jane', lastName: 'Doe',
      email: 'john@example.com', password: 'Password123!',
    })).rejects.toMatchObject({ code: 'EMAIL_EXISTS', statusCode: 409 });

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test('creates user, cart, wishlist and returns token on success', async () => {
    mockUserFindOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed_pw');

    const createdUser = makeUser({ id: 2, email: 'jane@example.com' });
    mockUserCreate.mockResolvedValue(createdUser);
    mockCartCreate.mockResolvedValue({});
    mockWishlistCreate.mockResolvedValue({});
    jwt.sign.mockReturnValue('new_token');

    const result = await AuthService.registerUser({
      firstName: 'Jane', lastName: 'Doe',
      email: 'jane@example.com', password: 'Password123!',
    });

    expect(mockUserCreate).toHaveBeenCalled();
    expect(mockCartCreate).toHaveBeenCalled();
    expect(mockWishlistCreate).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
    expect(result.token).toBe('new_token');
    expect(result.user).not.toHaveProperty('password');
  });
});
