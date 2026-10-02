const { z } = require('zod');

const checkoutSchema = z.object({
  body: z.object({
    shippingAddressId: z.number().int().positive('Shipping address ID must be a positive integer'),
    billingAddressId: z.number().int().positive().optional(),
    couponCode: z.string().trim().toUpperCase().optional(),
    paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'], {
      errorMap: () => ({ message: 'Invalid payment method' }),
    }),
    simulateFailure: z.boolean().optional().default(false),
  }),
});

const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    reason: z.string().trim().min(5, 'Cancellation reason must be at least 5 characters').max(500),
  }),
});

const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().toUpperCase().min(3, 'Coupon code too short'),
    subtotal: z.number().positive('Subtotal must be a positive number'),
  }),
});

const requestReturnSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive('Order ID must be a positive integer'),
    orderItemId: z.number().int().positive().optional(),
    reason: z.string().trim().min(10, 'Return reason must be at least 10 characters').max(1000),
    details: z.string().trim().max(2000).optional(),
  }),
});

module.exports = {
  checkoutSchema,
  cancelOrderSchema,
  validateCouponSchema,
  requestReturnSchema,
};
