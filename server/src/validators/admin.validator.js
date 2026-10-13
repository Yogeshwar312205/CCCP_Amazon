const { z } = require('zod');

const createProductSchema = z.object({
  body: z.preprocess(
    (raw) => {
      if (!raw || typeof raw !== 'object') return raw;
      const body = { ...raw };

      // Coerce string numbers from multipart/form-data
      if (typeof body.categoryId === 'string') body.categoryId = parseInt(body.categoryId, 10);
      if (typeof body.basePrice === 'string') body.basePrice = parseFloat(body.basePrice);
      if (typeof body.salePrice === 'string' && body.salePrice !== '') {
        body.salePrice = parseFloat(body.salePrice);
      } else if (body.salePrice === '') {
        body.salePrice = null;
      }
      if (typeof body.isFeatured === 'string') body.isFeatured = body.isFeatured === 'true';
      if (typeof body.isActive === 'string') body.isActive = body.isActive !== 'false';

      // Parse variants JSON string sent from FormData
      if (typeof body.variants === 'string') {
        try {
          const parsed = JSON.parse(body.variants);
          body.variants = parsed.map((v) => ({
            ...v,
            price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
            stockQuantity:
              typeof v.stockQuantity === 'string' ? parseInt(v.stockQuantity, 10) : v.stockQuantity,
          }));
        } catch {
          body.variants = [];
        }
      }

      return body;
    },
    z.object({
      title: z.string().trim().min(3, 'Title must be at least 3 characters'),
      slug: z.string().trim().optional(),
      sku: z.string().trim().min(3, 'SKU must be at least 3 characters'),
      brand: z.string().trim().optional(),
      categoryId: z.number().int().positive('Category ID must be a positive integer'),
      shortDescription: z.string().trim().optional(),
      description: z.string().trim().min(5, 'Description must be at least 5 characters'),
      basePrice: z.number().positive('Base price must be a positive number'),
      salePrice: z.number().positive('Sale price must be a positive number').optional().nullable(),
      isFeatured: z.boolean().optional().default(false),
      isActive: z.boolean().optional().default(true),
      variants: z
        .array(
          z.object({
            sku: z.string().trim().min(3, 'Variant SKU must be at least 3 characters'),
            variantName: z.string().trim().min(1, 'Variant name is required'),
            price: z.number().positive('Variant price must be positive'),
            stockQuantity: z.number().int().min(0).default(0),
            lowStockThreshold: z.number().int().min(0).optional().default(5),
          })
        )
        .optional()
        .default([]),
    })
  ),
});

const updateProductSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    title: z.string().trim().min(3).optional(),
    sku: z.string().trim().min(3).optional(),
    brand: z.string().trim().optional(),
    categoryId: z.number().int().positive().optional(),
    shortDescription: z.string().trim().optional(),
    description: z.string().trim().min(5).optional(),
    basePrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional().nullable(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

const inventoryAdjustSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    quantityChange: z.number().int(),
    type: z.enum(['RESTOCK', 'ADJUSTMENT', 'DAMAGE'], {
      errorMap: () => ({ message: 'Invalid inventory adjustment type' }),
    }),
    notes: z.string().trim().max(500).optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Invalid order status' }),
    }),
    carrier: z.string().trim().max(100).optional(),
    trackingNumber: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

const processReturnSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    action: z.enum(['APPROVE', 'REJECT', 'RECEIVE', 'COMPLETE_REFUND'], {
      errorMap: () => ({ message: 'Invalid return processing action' }),
    }),
    adminNotes: z.string().trim().max(1000).optional(),
  }),
});

const createCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().toUpperCase().min(3, 'Code must be at least 3 characters'),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number().positive('Discount value must be positive'),
    minimumOrderAmount: z.number().min(0).optional().default(0),
    maxDiscountAmount: z.number().positive().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional().default(true),
  }),
});

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional().nullable(),
    parentId: z.union([z.number().int().positive(), z.null()]).optional(),
    displayOrder: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional().nullable(),
    parentId: z.union([z.number().int().positive(), z.null()]).optional(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  inventoryAdjustSchema,
  updateOrderStatusSchema,
  processReturnSchema,
  createCouponSchema,
  createCategorySchema,
  updateCategorySchema,
};

