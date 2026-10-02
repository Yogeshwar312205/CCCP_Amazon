const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Address,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  ProductAttribute,
  Inventory,
  InventoryTransaction,
  Cart,
  Wishlist,
  Coupon,
} = require('../src/models');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding process...');

    // Force sync database to create fresh schema
    await sequelize.sync({ force: true });
    logger.info('Database tables created successfully.');

    // 1. Create Users
    const hashedSuperAdmin = await bcrypt.hash('SuperAdmin123!', 10);
    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@amazon.com',
      phone: '+18005550001',
      password: hashedSuperAdmin,
      role: 'SUPER_ADMIN',
    });

    const hashedAdmin = await bcrypt.hash('Admin123!', 10);
    const admin = await User.create({
      firstName: 'Store',
      lastName: 'Manager',
      email: 'admin@amazon.com',
      phone: '+18005550002',
      password: hashedAdmin,
      role: 'ADMIN',
    });

    const hashedCustomer = await bcrypt.hash('Customer123!', 10);
    const customer = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@amazon.com',
      phone: '+18005550003',
      password: hashedCustomer,
      role: 'CUSTOMER',
    });

    // Create Cart & Wishlist for customer
    await Cart.create({ userId: customer.id });
    await Wishlist.create({ userId: customer.id });

    // Customer Shipping Address
    await Address.create({
      userId: customer.id,
      fullName: 'John Doe',
      streetAddress: '123 Main Street',
      apartmentSuite: 'Apt 4B',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'USA',
      phone: '+18005550003',
      isDefaultShipping: true,
      isDefaultBilling: true,
      type: 'BOTH',
    });

    logger.info('Users and initial profiles seeded.');

    // 2. Create Categories
    const electronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets, phones, audio and smart home devices',
      displayOrder: 1,
    });

    const computers = await Category.create({
      name: 'Computers & Laptops',
      slug: 'computers-laptops',
      description: 'Laptops, desktops, monitors and PC accessories',
      parentId: electronics.id,
      displayOrder: 1,
    });

    const audio = await Category.create({
      name: 'Headphones & Audio',
      slug: 'headphones-audio',
      description: 'Wireless earbuds, noise-canceling headphones & speakers',
      parentId: electronics.id,
      displayOrder: 2,
    });

    const fashion = await Category.create({
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Men, women, and kids clothing and accessories',
      displayOrder: 2,
    });

    logger.info('Categories seeded.');

    // 3. Create Sample Products
    // Product 1: High-end Laptop
    const laptopProduct = await Product.create({
      categoryId: computers.id,
      title: 'EchoBook Pro 16 Laptop - M3 Max, 36GB RAM, 1TB SSD',
      slug: 'echobook-pro-16-laptop',
      sku: 'ECHO-PRO-16-BASE',
      brand: 'Echo',
      shortDescription: 'Ultra-fast laptop with stunning Liquid Retina XDR display and 22-hour battery life.',
      description: 'The EchoBook Pro 16 delivers groundbreaking performance for pros. With the powerful M3 Max chip, a gorgeous 16-inch display, and array of pro ports, you can accomplish more than ever before.',
      basePrice: 2499.99,
      salePrice: 2299.99,
      isFeatured: true,
      isActive: true,
      averageRating: 4.8,
      totalReviews: 25,
    });

    await ProductImage.create({
      productId: laptopProduct.id,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      altText: 'EchoBook Pro 16 Front View',
      isPrimary: true,
      displayOrder: 1,
    });

    await ProductAttribute.bulkCreate([
      { productId: laptopProduct.id, attributeKey: 'Processor', attributeValue: 'M3 Max 14-core CPU' },
      { productId: laptopProduct.id, attributeKey: 'RAM', attributeValue: '36GB Unified Memory' },
      { productId: laptopProduct.id, attributeKey: 'Storage', attributeValue: '1TB Superfast NVMe SSD' },
      { productId: laptopProduct.id, attributeKey: 'Display', attributeValue: '16.2-inch Liquid Retina XDR' },
    ]);

    const laptopVariant1 = await ProductVariant.create({
      productId: laptopProduct.id,
      sku: 'ECHO-PRO-16-SILVER-1TB',
      variantName: 'Color: Space Silver, Storage: 1TB',
      price: 2299.99,
      stockQuantity: 15,
    });

    const laptopVariant2 = await ProductVariant.create({
      productId: laptopProduct.id,
      sku: 'ECHO-PRO-16-BLACK-2TB',
      variantName: 'Color: Space Black, Storage: 2TB',
      price: 2699.99,
      stockQuantity: 8,
    });

    const inv1 = await Inventory.create({
      productId: laptopProduct.id,
      variantId: laptopVariant1.id,
      stockQuantity: 15,
      lowStockThreshold: 5,
    });
    const inv2 = await Inventory.create({
      productId: laptopProduct.id,
      variantId: laptopVariant2.id,
      stockQuantity: 8,
      lowStockThreshold: 3,
    });

    await InventoryTransaction.create({
      inventoryId: inv1.id,
      quantityChange: 15,
      type: 'RESTOCK',
      performedBy: admin.id,
      notes: 'Initial warehouse stock load',
    });

    // Product 2: Wireless Headphones
    const headphoneProduct = await Product.create({
      categoryId: audio.id,
      title: 'SoundPulse ANC Wireless Noise Canceling Headphones',
      slug: 'soundpulse-anc-wireless-headphones',
      sku: 'SP-ANC-500',
      brand: 'SoundPulse',
      shortDescription: 'Active Noise Cancellation with 40-hour battery life and spatial audio.',
      description: 'Immerse yourself in music with SoundPulse ANC Headphones. Featuring custom-tuned 40mm drivers, multipoint Bluetooth 5.3 connection, and plush memory foam earcups.',
      basePrice: 299.99,
      salePrice: 199.99,
      isFeatured: true,
      isActive: true,
      averageRating: 4.6,
      totalReviews: 42,
    });

    await ProductImage.create({
      productId: headphoneProduct.id,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      altText: 'SoundPulse ANC Headphones Black',
      isPrimary: true,
      displayOrder: 1,
    });

    const hpVariant1 = await ProductVariant.create({
      productId: headphoneProduct.id,
      sku: 'SP-ANC-500-BLK',
      variantName: 'Color: Matte Black',
      price: 199.99,
      stockQuantity: 4, // Low stock demo
    });

    const inv3 = await Inventory.create({
      productId: headphoneProduct.id,
      variantId: hpVariant1.id,
      stockQuantity: 4,
      lowStockThreshold: 5,
    });

    await InventoryTransaction.create({
      inventoryId: inv3.id,
      quantityChange: 4,
      type: 'RESTOCK',
      performedBy: admin.id,
      notes: 'Initial stock load (low stock state for demo)',
    });

    logger.info('Sample products, variants, and inventory seeded.');

    // 4. Create Coupons
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      minimumOrderAmount: 50.00,
      maxDiscountAmount: 100.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 500,
      isActive: true,
    });

    await Coupon.create({
      code: 'SAVEMORE20',
      discountType: 'FIXED_AMOUNT',
      discountValue: 20.00,
      minimumOrderAmount: 150.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
      isActive: true,
    });

    logger.info('Coupons seeded.');
    logger.info('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
