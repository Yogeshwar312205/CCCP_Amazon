/**
 * Coupon Service unit tests — validates discount calculation logic.
 * DB models are fully mocked.
 */

jest.mock('../../../config/logger', () => ({
  error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn(),
}));

const mockCouponFindOne   = jest.fn();
const mockUsageCount      = jest.fn();

jest.mock('../../../src/models', () => ({
  Coupon:       { findOne: (...a) => mockCouponFindOne(...a) },
  CouponUsage:  { count: (...a) => mockUsageCount(...a) },
}));

const CouponService = require('../../../src/services/coupon.service');

// ---- Helpers ----
const makeCoupon = (overrides = {}) => ({
  id: 10,
  code: 'SAVE10',
  isActive: true,
  usageLimit: 100,
  usageCount: 5,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2027-01-01'),
  minimumOrderAmount: 50,
  discountType: 'PERCENTAGE',
  discountValue: 10,
  maxDiscountAmount: 50,
  ...overrides,
});

describe('CouponService.validateCoupon()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsageCount.mockResolvedValue(0); // default: user hasn't used coupon
  });

  test('throws INVALID_COUPON for invalid code', async () => {
    mockCouponFindOne.mockResolvedValue(null);

    await expect(CouponService.validateCoupon('BADCODE', 100, 1))
      .rejects.toMatchObject({ code: 'INVALID_COUPON' });
  });

  test('throws COUPON_EXPIRED when coupon dates are out of range', async () => {
    mockCouponFindOne.mockResolvedValue(makeCoupon({
      startDate: new Date('2020-01-01'),
      endDate:   new Date('2020-12-31'), // expired
    }));

    await expect(CouponService.validateCoupon('SAVE10', 100, 1))
      .rejects.toMatchObject({ code: 'COUPON_EXPIRED' });
  });

  test('throws COUPON_LIMIT_REACHED when usageCount >= usageLimit', async () => {
    mockCouponFindOne.mockResolvedValue(
      makeCoupon({ usageLimit: 10, usageCount: 10 })
    );

    await expect(CouponService.validateCoupon('SAVE10', 100, 1))
      .rejects.toMatchObject({ code: 'COUPON_LIMIT_REACHED' });
  });

  test('throws MINIMUM_ORDER_NOT_MET when subtotal is too low', async () => {
    mockCouponFindOne.mockResolvedValue(makeCoupon({ minimumOrderAmount: 200 }));

    await expect(CouponService.validateCoupon('SAVE10', 50, 1))
      .rejects.toMatchObject({ code: 'MINIMUM_ORDER_NOT_MET' });
  });

  test('calculates PERCENTAGE discount correctly', async () => {
    mockCouponFindOne.mockResolvedValue(makeCoupon({
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscountAmount: 100,
    }));
    mockUsageCount.mockResolvedValue(0);

    const result = await CouponService.validateCoupon('SAVE10', 200, 1);
    expect(result.discountAmount).toBe(20);
  });

  test('caps PERCENTAGE discount at maxDiscountAmount', async () => {
    mockCouponFindOne.mockResolvedValue(makeCoupon({
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maxDiscountAmount: 30,
    }));
    mockUsageCount.mockResolvedValue(0);

    const result = await CouponService.validateCoupon('SAVE10', 200, 1);
    expect(result.discountAmount).toBe(30);
  });

  test('calculates FIXED_AMOUNT discount correctly', async () => {
    mockCouponFindOne.mockResolvedValue(makeCoupon({
      discountType: 'FIXED_AMOUNT',
      discountValue: 25,
      maxDiscountAmount: null,
    }));
    mockUsageCount.mockResolvedValue(0);

    const result = await CouponService.validateCoupon('SAVE10', 200, 1);
    expect(result.discountAmount).toBe(25);
  });

  test('discount never exceeds subtotal', async () => {
    mockCouponFindOne.mockResolvedValue(makeCoupon({
      discountType: 'FIXED_AMOUNT',
      discountValue: 999,
      maxDiscountAmount: null,
      minimumOrderAmount: 0,
    }));
    mockUsageCount.mockResolvedValue(0);

    const result = await CouponService.validateCoupon('SAVE10', 50, 1);
    expect(result.discountAmount).toBeLessThanOrEqual(50);
  });
});
