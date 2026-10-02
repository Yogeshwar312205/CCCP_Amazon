const { z } = require('zod');

const addToCartSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('Product ID must be a positive integer'),
    variantId: z.number().int().positive('Variant ID must be a positive integer').optional().nullable(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  }),
});

const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
};
