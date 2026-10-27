const { Op } = require('sequelize');
const {
  Product,
  Category,
  ProductImage,
  ProductVariant,
  ProductAttribute,
  Inventory,
} = require('../models');

class ProductService {
  static async queryProducts(filters) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      minRating,
      sort,
      page,
      limit,
    } = filters;

    const whereConditions = { isActive: true };

    // Search filter (title, brand, or description)
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ];
    }

    // Category filter (match category slug/id + its child subcategories)
    if (category) {
      const categoryObj = isNaN(category)
        ? await Category.findOne({ where: { slug: category } })
        : await Category.findByPk(category);

      if (categoryObj) {
        const subcategories = await Category.findAll({
          where: { parentId: categoryObj.id },
          attributes: ['id'],
        });
        const categoryIds = [categoryObj.id, ...subcategories.map((c) => c.id)];
        whereConditions.categoryId = { [Op.in]: categoryIds };
      }
    }

    // Brand filter
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      whereConditions.brand = { [Op.in]: brands };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCondition = {};
      if (minPrice !== undefined) priceCondition[Op.gte] = minPrice;
      if (maxPrice !== undefined) priceCondition[Op.lte] = maxPrice;
      whereConditions.basePrice = priceCondition;
    }

    // Minimum rating filter
    if (minRating !== undefined) {
      whereConditions.averageRating = { [Op.gte]: minRating };
    }

    // Sorting strategy
    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['basePrice', 'ASC']];
    if (sort === 'price_desc') order = [['basePrice', 'DESC']];
    if (sort === 'rating') order = [['averageRating', 'DESC']];
    if (sort === 'popularity') order = [['totalReviews', 'DESC']];

    const offset = (page - 1) * limit;

    // Execute query with associations
    const { count, rows } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary'],
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false,
        },
      ],
      order,
      limit,
      offset,
      distinct: true,
    });

    // Extract unique brands for filter sidebar options
    const availableBrands = await Product.findAll({
      attributes: ['brand'],
      where: { isActive: true, brand: { [Op.ne]: null } },
      group: ['brand'],
      raw: true,
    });

    return {
      products: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      availableBrands: availableBrands.map((b) => b.brand),
    };
  }

  static async getFeaturedProducts() {
    return await Product.findAll({
      where: { isActive: true, isFeatured: true },
      include: [
        { model: Category, as: 'category', attributes: ['name', 'slug'] },
        { model: ProductImage, as: 'images', attributes: ['imageUrl', 'altText', 'isPrimary'] },
      ],
      limit: 8,
      order: [['createdAt', 'DESC']],
    });
  }

  static async getProductBySlug(slug) {
    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder'],
          order: [['displayOrder', 'ASC']],
        },
        {
          model: ProductVariant,
          as: 'variants',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['stockQuantity', 'lowStockThreshold'],
            },
          ],
        },
        {
          model: ProductAttribute,
          as: 'attributes',
          attributes: ['id', 'attributeKey', 'attributeValue'],
        },
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['stockQuantity', 'lowStockThreshold'],
        },
      ],
    });

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    return product;
  }
}

module.exports = ProductService;
