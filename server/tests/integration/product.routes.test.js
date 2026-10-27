/**
 * Product API integration tests.
 * Mocks ProductService so no real DB needed.
 */

const request = require('supertest');

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
jest.mock('../../src/models', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync:         jest.fn().mockResolvedValue(),
    getDialect:   jest.fn().mockReturnValue('mysql'),
  },
}));
jest.mock('../../src/middlewares/rateLimiter.middleware', () => ({
  globalLimiter: (req, res, next) => next(),
  authLimiter:   (req, res, next) => next(),
}));

// ---- Mock ProductService ----
const mockGetProducts      = jest.fn();
const mockGetFeatured      = jest.fn();
const mockGetBySlug        = jest.fn();

jest.mock('../../src/services/product.service', () => ({
  queryProducts:      (...a) => mockGetProducts(...a),
  getFeaturedProducts: (...a) => mockGetFeatured(...a),
  getProductBySlug:   (...a) => mockGetBySlug(...a),
}));

const app = require('../../server');

// ---- Sample Data ----
const sampleProduct = {
  id: 1,
  title: 'EchoBook Pro 16',
  slug: 'echobook-pro-16-laptop',
  brand: 'Echo',
  salePrice: 2299.99,
  averageRating: 4.8,
  totalReviews: 3,
};

const paginationMeta = { page: 1, limit: 12, total: 1, totalPages: 1 };

// =========================================================
describe('GET /api/v1/products', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - returns product list with pagination meta', async () => {
    mockGetProducts.mockResolvedValue({
      products:        [sampleProduct],
      pagination:      paginationMeta,
      availableBrands: ['Echo', 'SoundPulse'],
    });

    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.pagination).toBeDefined();
  });

  test('200 - passes search query param to service', async () => {
    mockGetProducts.mockResolvedValue({
      products: [], pagination: { ...paginationMeta, total: 0 }, availableBrands: [],
    });

    await request(app).get('/api/v1/products?search=laptop&sort=price_asc&page=1');

    const calledWith = mockGetProducts.mock.calls[0][0];
    expect(calledWith.search).toBe('laptop');
    expect(calledWith.sort).toBe('price_asc');
  });

  test('500 - returns error when service throws', async () => {
    mockGetProducts.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/v1/products');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// =========================================================
describe('GET /api/v1/products/featured', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - returns featured products array', async () => {
    mockGetFeatured.mockResolvedValue([sampleProduct]);

    const res = await request(app).get('/api/v1/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });
});

// =========================================================
describe('GET /api/v1/products/:slug', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 - returns product detail for valid slug', async () => {
    mockGetBySlug.mockResolvedValue(sampleProduct);

    const res = await request(app).get('/api/v1/products/echobook-pro-16-laptop');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.slug).toBe('echobook-pro-16-laptop');
  });

  test('404 - returns PRODUCT_NOT_FOUND for unknown slug', async () => {
    const err = new Error('Product not found');
    err.statusCode = 404;
    err.code = 'PRODUCT_NOT_FOUND';
    mockGetBySlug.mockRejectedValue(err);

    const res = await request(app).get('/api/v1/products/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});
