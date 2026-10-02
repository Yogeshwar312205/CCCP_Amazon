const { z } = require('zod');

const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(), // Slug or ID
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    brand: z.string().optional(),
    minRating: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    inStockOnly: z.string().optional().transform((val) => val === 'true'),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'popularity']).optional().default('newest'),
    page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z.string().optional().default('12').transform((val) => Math.max(1, Math.min(50, parseInt(val, 10)))),
  }),
});

module.exports = {
  productQuerySchema,
};
