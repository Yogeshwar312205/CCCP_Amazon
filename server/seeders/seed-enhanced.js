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
  Review,
  ReviewImage,
  ProductQuestion,
  ProductAnswer,
} = require('../src/models');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    logger.info('🚀 Starting ENHANCED database seeding process...');

    // Force sync database to create fresh schema
    await sequelize.sync({ force: true });
    logger.info('✅ Database tables created successfully.');

    // ========================================
    // 1. CREATE USERS
    // ========================================
    logger.info('Creating users...');

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
    const customer1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'customer@amazon.com',
      phone: '+18005550003',
      password: hashedCustomer,
      role: 'CUSTOMER',
    });

    // Additional test customers
    const customer2 = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+18005550004',
      password: await bcrypt.hash('Customer123!', 10),
      role: 'CUSTOMER',
    });

    const customer3 = await User.create({
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@example.com',
      phone: '+18005550005',
      password: await bcrypt.hash('Customer123!', 10),
      role: 'CUSTOMER',
    });

    // Create Cart & Wishlist for customers
    await Cart.create({ userId: customer1.id });
    await Wishlist.create({ userId: customer1.id });
    await Cart.create({ userId: customer2.id });
    await Wishlist.create({ userId: customer2.id });
    await Cart.create({ userId: customer3.id });
    await Wishlist.create({ userId: customer3.id });

    // Customer Addresses
    await Address.create({
      userId: customer1.id,
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

    logger.info('✅ Users and profiles seeded.');

    // ========================================
    // 2. CREATE CATEGORIES
    // ========================================
    logger.info('Creating categories...');

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

    const phones = await Category.create({
      name: 'Smartphones',
      slug: 'smartphones',
      description: '5G smartphones, cases, and accessories',
      parentId: electronics.id,
      displayOrder: 3,
    });

    const fashion = await Category.create({
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Men, women, and kids clothing and accessories',
      displayOrder: 2,
    });

    const home = await Category.create({
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Furniture, appliances, and home decor',
      displayOrder: 3,
    });

    logger.info('✅ Categories seeded.');

    // ========================================
    // 3. CREATE PRODUCTS (15 PRODUCTS)
    // ========================================
    logger.info('Creating products...');

    // PRODUCT 1: Laptop
    const laptop = await Product.create({
      categoryId: computers.id,
      title: 'EchoBook Pro 16 Laptop - M3 Max, 36GB RAM, 1TB SSD',
      slug: 'echobook-pro-16-laptop',
      sku: 'ECHO-PRO-16-BASE',
      brand: 'Echo',
      shortDescription: 'Ultra-fast laptop with stunning Liquid Retina XDR display and 22-hour battery life.',
      description: 'The EchoBook Pro 16 delivers groundbreaking performance for pros. With the powerful M3 Max chip, a gorgeous 16-inch display, and array of pro ports, you can accomplish more than ever before. Perfect for developers, designers, and content creators.',
      basePrice: 2499.99,
      salePrice: 2299.99,
      isFeatured: true,
      isActive: true,
      averageRating: 4.8,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: laptop.id,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      altText: 'EchoBook Pro 16 Front View',
      isPrimary: true,
      displayOrder: 1,
    });

    await ProductAttribute.bulkCreate([
      { productId: laptop.id, attributeKey: 'Processor', attributeValue: 'M3 Max 14-core CPU' },
      { productId: laptop.id, attributeKey: 'RAM', attributeValue: '36GB Unified Memory' },
      { productId: laptop.id, attributeKey: 'Storage', attributeValue: '1TB Superfast NVMe SSD' },
      { productId: laptop.id, attributeKey: 'Display', attributeValue: '16.2-inch Liquid Retina XDR' },
      { productId: laptop.id, attributeKey: 'Battery Life', attributeValue: 'Up to 22 hours' },
      { productId: laptop.id, attributeKey: 'Weight', attributeValue: '4.7 lbs (2.1 kg)' },
    ]);

    const laptopVariant1 = await ProductVariant.create({
      productId: laptop.id,
      sku: 'ECHO-PRO-16-SILVER-1TB',
      variantName: 'Color: Space Silver, Storage: 1TB',
      price: 2299.99,
      stockQuantity: 15,
    });

    await Inventory.create({
      productId: laptop.id,
      variantId: laptopVariant1.id,
      stockQuantity: 15,
      lowStockThreshold: 5,
    });

    // PRODUCT 2: Headphones
    const headphones = await Product.create({
      categoryId: audio.id,
      title: 'SoundPulse ANC Wireless Noise Canceling Headphones',
      slug: 'soundpulse-anc-wireless-headphones',
      sku: 'SP-ANC-500',
      brand: 'SoundPulse',
      shortDescription: 'Active Noise Cancellation with 40-hour battery life and spatial audio.',
      description: 'Immerse yourself in music with SoundPulse ANC Headphones. Featuring custom-tuned 40mm drivers, multipoint Bluetooth 5.3 connection, and plush memory foam earcups. Perfect for travel, work, or relaxation.',
      basePrice: 299.99,
      salePrice: 199.99,
      isFeatured: true,
      isActive: true,
      averageRating: 4.6,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: headphones.id,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      altText: 'SoundPulse ANC Headphones Black',
      isPrimary: true,
      displayOrder: 1,
    });

    await ProductAttribute.bulkCreate([
      { productId: headphones.id, attributeKey: 'Driver Size', attributeValue: '40mm Custom Drivers' },
      { productId: headphones.id, attributeKey: 'Battery Life', attributeValue: 'Up to 40 hours' },
      { productId: headphones.id, attributeKey: 'Bluetooth', attributeValue: 'Bluetooth 5.3' },
      { productId: headphones.id, attributeKey: 'Weight', attributeValue: '250g' },
    ]);

    const headphonesVariant = await ProductVariant.create({
      productId: headphones.id,
      sku: 'SP-ANC-500-BLK',
      variantName: 'Color: Matte Black',
      price: 199.99,
      stockQuantity: 25,
    });

    await Inventory.create({
      productId: headphones.id,
      variantId: headphonesVariant.id,
      stockQuantity: 25,
      lowStockThreshold: 5,
    });

    // PRODUCT 3: Smartphone
    const phone = await Product.create({
      categoryId: phones.id,
      title: 'Galaxy X Pro 5G - 256GB, Phantom Black',
      slug: 'galaxy-x-pro-5g-256gb',
      sku: 'GXP-256-BLK',
      brand: 'Galaxy',
      shortDescription: '6.8" Dynamic AMOLED display, 108MP camera, 5000mAh battery.',
      description: 'Experience the future with Galaxy X Pro. Stunning 120Hz display, professional-grade camera system, and all-day battery life. 5G connectivity keeps you connected at blazing speeds.',
      basePrice: 1199.99,
      salePrice: 999.99,
      isFeatured: true,
      isActive: true,
      averageRating: 4.7,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: phone.id,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      altText: 'Galaxy X Pro Smartphone',
      isPrimary: true,
      displayOrder: 1,
    });

    await ProductAttribute.bulkCreate([
      { productId: phone.id, attributeKey: 'Display', attributeValue: '6.8" Dynamic AMOLED 2X, 120Hz' },
      { productId: phone.id, attributeKey: 'Camera', attributeValue: '108MP Main + 12MP Ultra Wide + 10MP Telephoto' },
      { productId: phone.id, attributeKey: 'Battery', attributeValue: '5000mAh with Fast Charging' },
      { productId: phone.id, attributeKey: 'Processor', attributeValue: 'Snapdragon 8 Gen 3' },
      { productId: phone.id, attributeKey: 'RAM', attributeValue: '12GB' },
      { productId: phone.id, attributeKey: 'Storage', attributeValue: '256GB' },
    ]);

    const phoneVariant = await ProductVariant.create({
      productId: phone.id,
      sku: 'GXP-256-BLK',
      variantName: 'Color: Phantom Black, Storage: 256GB',
      price: 999.99,
      stockQuantity: 30,
    });

    await Inventory.create({
      productId: phone.id,
      variantId: phoneVariant.id,
      stockQuantity: 30,
      lowStockThreshold: 10,
    });

    // PRODUCT 4: Wireless Earbuds
    const earbuds = await Product.create({
      categoryId: audio.id,
      title: 'AirFlow Pro True Wireless Earbuds with ANC',
      slug: 'airflow-pro-wireless-earbuds',
      sku: 'AFP-TWS-ANC',
      brand: 'AirFlow',
      shortDescription: 'Premium sound, active noise cancellation, 30-hour battery life.',
      description: 'AirFlow Pro delivers studio-quality sound in a compact design. Features adaptive ANC, transparency mode, and IPX5 water resistance. Perfect for workouts, commutes, and calls.',
      basePrice: 179.99,
      salePrice: 149.99,
      isFeatured: false,
      isActive: true,
      averageRating: 4.5,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: earbuds.id,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      altText: 'AirFlow Pro Wireless Earbuds',
      isPrimary: true,
      displayOrder: 1,
    });

    const earbudsVariant = await ProductVariant.create({
      productId: earbuds.id,
      sku: 'AFP-TWS-WHT',
      variantName: 'Color: Pearl White',
      price: 149.99,
      stockQuantity: 50,
    });

    await Inventory.create({
      productId: earbuds.id,
      variantId: earbudsVariant.id,
      stockQuantity: 50,
      lowStockThreshold: 15,
    });

    // PRODUCT 5: Monitor
    const monitor = await Product.create({
      categoryId: computers.id,
      title: 'UltraView 27" 4K USB-C Monitor',
      slug: 'ultraview-27-4k-usbc-monitor',
      sku: 'UV-27-4K-USBC',
      brand: 'UltraView',
      shortDescription: '27-inch 4K UHD display with 99% sRGB, USB-C connectivity.',
      description: 'Professional-grade monitor perfect for creative work. 4K resolution, HDR10 support, and USB-C one-cable solution delivers power and data. Ergonomic stand with height adjustment.',
      basePrice: 599.99,
      salePrice: 499.99,
      isFeatured: false,
      isActive: true,
      averageRating: 4.6,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: monitor.id,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      altText: 'UltraView 4K Monitor',
      isPrimary: true,
      displayOrder: 1,
    });

    const monitorVariant = await ProductVariant.create({
      productId: monitor.id,
      sku: 'UV-27-4K-BLK',
      variantName: 'Size: 27-inch, Color: Black',
      price: 499.99,
      stockQuantity: 12,
    });

    await Inventory.create({
      productId: monitor.id,
      variantId: monitorVariant.id,
      stockQuantity: 12,
      lowStockThreshold: 5,
    });

    // PRODUCT 6: Mechanical Keyboard
    const keyboard = await Product.create({
      categoryId: computers.id,
      title: 'MechaKey RGB Mechanical Gaming Keyboard',
      slug: 'mechakey-rgb-mechanical-keyboard',
      sku: 'MK-RGB-MECH',
      brand: 'MechaKey',
      shortDescription: 'Hot-swappable switches, RGB backlighting, aluminum frame.',
      description: 'Premium mechanical keyboard with customizable RGB lighting and hot-swappable switches. Perfect for gaming and productivity. Features PBT keycaps and detachable USB-C cable.',
      basePrice: 149.99,
      salePrice: 119.99,
      isFeatured: false,
      isActive: true,
      averageRating: 4.7,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: keyboard.id,
      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800',
      altText: 'MechaKey RGB Mechanical Keyboard',
      isPrimary: true,
      displayOrder: 1,
    });

    const keyboardVariant = await ProductVariant.create({
      productId: keyboard.id,
      sku: 'MK-RGB-BLUE',
      variantName: 'Switch Type: Blue (Clicky)',
      price: 119.99,
      stockQuantity: 20,
    });

    await Inventory.create({
      productId: keyboard.id,
      variantId: keyboardVariant.id,
      stockQuantity: 20,
      lowStockThreshold: 8,
    });

    // PRODUCT 7: Wireless Mouse
    const mouse = await Product.create({
      categoryId: computers.id,
      title: 'ErgoGlide Pro Wireless Mouse',
      slug: 'ergoglide-pro-wireless-mouse',
      sku: 'EG-PRO-WLS',
      brand: 'ErgoGlide',
      shortDescription: 'Ergonomic design, 16000 DPI, rechargeable battery.',
      description: 'Precision wireless mouse designed for all-day comfort. Features customizable DPI settings, programmable buttons, and 70-hour battery life. Perfect for work and gaming.',
      basePrice: 79.99,
      salePrice: 59.99,
      isFeatured: false,
      isActive: true,
      averageRating: 4.4,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: mouse.id,
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
      altText: 'ErgoGlide Pro Wireless Mouse',
      isPrimary: true,
      displayOrder: 1,
    });

    const mouseVariant = await ProductVariant.create({
      productId: mouse.id,
      sku: 'EG-PRO-BLK',
      variantName: 'Color: Matte Black',
      price: 59.99,
      stockQuantity: 35,
    });

    await Inventory.create({
      productId: mouse.id,
      variantId: mouseVariant.id,
      stockQuantity: 35,
      lowStockThreshold: 10,
    });

    // PRODUCT 8: Webcam
    const webcam = await Product.create({
      categoryId: computers.id,
      title: 'StreamCast 4K Webcam with Auto-Focus',
      slug: 'streamcast-4k-webcam',
      sku: 'SC-4K-AF',
      brand: 'StreamCast',
      shortDescription: '4K resolution, dual microphones, auto-framing.',
      description: 'Professional webcam for streaming, video calls, and content creation. Features AI-powered auto-framing, low-light correction, and studio-quality microphones.',
      basePrice: 129.99,
      salePrice: 99.99,
      isFeatured: false,
      isActive: true,
      averageRating: 4.5,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: webcam.id,
      imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800',
      altText: 'StreamCast 4K Webcam',
      isPrimary: true,
      displayOrder: 1,
    });

    const webcamVariant = await ProductVariant.create({
      productId: webcam.id,
      sku: 'SC-4K-BLK',
      variantName: 'Color: Black',
      price: 99.99,
      stockQuantity: 18,
    });

    await Inventory.create({
      productId: webcam.id,
      variantId: webcamVariant.id,
      stockQuantity: 18,
      lowStockThreshold: 5,
    });

    // PRODUCT 9: Smart Watch
    const smartwatch = await Product.create({
      categoryId: electronics.id,
      title: 'FitPro Max Smartwatch - GPS, Heart Rate, SpO2',
      slug: 'fitpro-max-smartwatch',
      sku: 'FP-MAX-GPS',
      brand: 'FitPro',
      shortDescription: 'AMOLED display, 7-day battery, 100+ workout modes.',
      description: 'Advanced fitness smartwatch with GPS tracking, heart rate monitoring, and sleep analysis. Features always-on AMOLED display and water resistance up to 50m.',
      basePrice: 349.99,
      salePrice: 279.99,
      isFeatured: true,
      isActive: true,
      averageRating: 4.6,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: smartwatch.id,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      altText: 'FitPro Max Smartwatch',
      isPrimary: true,
      displayOrder: 1,
    });

    const smartwatchVariant = await ProductVariant.create({
      productId: smartwatch.id,
      sku: 'FP-MAX-BLK-42',
      variantName: 'Size: 42mm, Color: Midnight Black',
      price: 279.99,
      stockQuantity: 22,
    });

    await Inventory.create({
      productId: smartwatch.id,
      variantId: smartwatchVariant.id,
      stockQuantity: 22,
      lowStockThreshold: 8,
    });

    // PRODUCT 10: Portable SSD
    const ssd = await Product.create({
      categoryId: computers.id,
      title: 'FastDrive Pro 2TB Portable SSD - USB 3.2 Gen 2',
      slug: 'fastdrive-pro-2tb-portable-ssd',
      sku: 'FD-PRO-2TB',
      brand: 'FastDrive',
      shortDescription: 'Up to 1050MB/s read speed, shock-resistant, compact design.',
      description: 'Ultra-fast portable storage for professionals. Transfer large files in seconds with read speeds up to 1050MB/s. Durable aluminum casing and 256-bit AES hardware encryption.',
      basePrice: 249.99,
      salePrice: 199.99,
      isFeatured: false,
      isActive: true,
      averageRating: 4.8,
      totalReviews: 0,
    });

    await ProductImage.create({
      productId: ssd.id,
      imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800',
      altText: 'FastDrive Portable SSD',
      isPrimary: true,
      displayOrder: 1,
    });

    const ssdVariant = await ProductVariant.create({
      productId: ssd.id,
      sku: 'FD-PRO-2TB-GRY',
      variantName: 'Capacity: 2TB, Color: Space Gray',
      price: 199.99,
      stockQuantity: 28,
    });

    await Inventory.create({
      productId: ssd.id,
      variantId: ssdVariant.id,
      stockQuantity: 28,
      lowStockThreshold: 10,
    });

    logger.info('✅ Products seeded.');

    // ========================================
    // 4. CREATE REVIEWS
    // ========================================
    logger.info('Creating reviews...');

    // Reviews for Laptop
    await Review.create({
      userId: customer1.id,
      productId: laptop.id,
      rating: 5,
      title: 'Best laptop I\'ve ever owned!',
      comment: 'The performance is incredible. The M3 Max chip handles everything I throw at it - video editing, 3D rendering, multiple VMs. The display is stunning and the battery lasts all day. Worth every penny!',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer2.id,
      productId: laptop.id,
      rating: 5,
      title: 'Perfect for developers',
      comment: 'As a full-stack developer, this laptop is a dream. Compiles are lightning fast, Docker runs smoothly, and I can have 50+ browser tabs open without slowdown. The keyboard is comfortable for long coding sessions.',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer3.id,
      productId: laptop.id,
      rating: 4,
      title: 'Great but expensive',
      comment: 'Amazing performance and build quality. The only downside is the price. If you can afford it, it\'s absolutely worth it. Battery life is as advertised.',
      isVerifiedPurchase: false,
    });

    // Reviews for Headphones
    await Review.create({
      userId: customer1.id,
      productId: headphones.id,
      rating: 5,
      title: 'Noise cancellation is phenomenal',
      comment: 'These headphones completely block out background noise. Perfect for open office work. Sound quality is excellent and the battery lasts for days. Comfort is top-notch even after 8+ hours.',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer2.id,
      productId: headphones.id,
      rating: 4,
      title: 'Great value for money',
      comment: 'At this price point, you can\'t go wrong. ANC works great, sound is balanced, and build quality is solid. Only complaint is they don\'t fold flat for travel.',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer3.id,
      productId: headphones.id,
      rating: 5,
      title: 'Best headphones under $200',
      comment: 'Incredible sound quality and ANC performance. Battery life is amazing - I charge them once a week with daily use. Highly recommend!',
      isVerifiedPurchase: true,
    });

    // Reviews for Smartphone
    await Review.create({
      userId: customer1.id,
      productId: phone.id,
      rating: 5,
      title: 'Camera is insane!',
      comment: 'The 108MP camera takes professional-quality photos. Night mode is incredible. The 120Hz display is buttery smooth and the battery easily lasts a full day with heavy use.',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer2.id,
      productId: phone.id,
      rating: 4,
      title: 'Solid flagship phone',
      comment: 'Great performance, excellent display, and good battery life. 5G connectivity is blazing fast. The phone is a bit large for one-handed use though.',
      isVerifiedPurchase: true,
    });

    // Reviews for Earbuds
    await Review.create({
      userId: customer1.id,
      productId: earbuds.id,
      rating: 4,
      title: 'Great for workouts',
      comment: 'Sound quality is excellent and they stay in place during runs. ANC is good but not as strong as over-ear headphones. Battery life is fantastic.',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer3.id,
      productId: earbuds.id,
      rating: 5,
      title: 'Perfect daily driver',
      comment: 'Use these every day for calls, music, and podcasts. Sound is clear, connection is stable, and the case is compact. Highly recommend!',
      isVerifiedPurchase: true,
    });

    // Reviews for Monitor
    await Review.create({
      userId: customer2.id,
      productId: monitor.id,
      rating: 5,
      title: 'Perfect for photo editing',
      comment: 'Colors are accurate right out of the box. The 4K resolution is crisp and the USB-C connection is super convenient. Great value for a professional monitor.',
      isVerifiedPurchase: true,
    });

    // Reviews for Keyboard
    await Review.create({
      userId: customer1.id,
      productId: keyboard.id,
      rating: 5,
      title: 'Best typing experience',
      comment: 'The blue switches feel amazing to type on. RGB lighting is customizable and looks great. Build quality is excellent - this keyboard will last for years.',
      isVerifiedPurchase: true,
    });

    await Review.create({
      userId: customer3.id,
      productId: keyboard.id,
      rating: 4,
      title: 'Great for gaming and work',
      comment: 'Responsive switches and comfortable layout. The hot-swap feature is a nice touch. Only wish it came with a wrist rest.',
      isVerifiedPurchase: false,
    });

    // Reviews for Smartwatch
    await Review.create({
      userId: customer2.id,
      productId: smartwatch.id,
      rating: 5,
      title: 'Best fitness tracker',
      comment: 'Tracks all my workouts accurately. Sleep tracking has helped me improve my sleep quality. Battery lasts a full week even with always-on display.',
      isVerifiedPurchase: true,
    });

    logger.info('✅ Reviews seeded.');

    // ========================================
    // 5. CREATE QUESTIONS & ANSWERS
    // ========================================
    logger.info('Creating questions and answers...');

    // Questions for Laptop
    const q1 = await ProductQuestion.create({
      userId: customer3.id,
      productId: laptop.id,
      question: 'Does this laptop support external monitors? How many?',
    });

    await ProductAnswer.create({
      questionId: q1.id,
      userId: admin.id,
      answer: 'Yes! The EchoBook Pro 16 supports up to two external displays at 6K resolution @ 60Hz or up to four displays at 4K @ 60Hz via Thunderbolt 4 ports.',
      isOfficial: true,
    });

    const q2 = await ProductQuestion.create({
      userId: customer1.id,
      productId: laptop.id,
      question: 'Can the RAM be upgraded after purchase?',
    });

    await ProductAnswer.create({
      questionId: q2.id,
      userId: admin.id,
      answer: 'The RAM is unified memory soldered to the logic board and cannot be upgraded after purchase. We recommend ordering with the maximum RAM you think you\'ll need.',
      isOfficial: true,
    });

    // Questions for Headphones
    const q3 = await ProductQuestion.create({
      userId: customer2.id,
      productId: headphones.id,
      question: 'Do these work with iPhone and Android?',
    });

    await ProductAnswer.create({
      questionId: q3.id,
      userId: customer1.id,
      answer: 'Yes! They work perfectly with both iPhone and Android devices via Bluetooth. I use them with my Samsung phone and they pair instantly.',
      isOfficial: false,
    });

    await ProductAnswer.create({
      questionId: q3.id,
      userId: admin.id,
      answer: 'Correct! SoundPulse ANC headphones are compatible with any Bluetooth-enabled device including iPhone, Android, tablets, and laptops.',
      isOfficial: true,
    });

    const q4 = await ProductQuestion.create({
      userId: customer3.id,
      productId: headphones.id,
      question: 'How is the microphone quality for calls?',
    });

    await ProductAnswer.create({
      questionId: q4.id,
      userId: customer2.id,
      answer: 'Microphone quality is excellent! I use these for Zoom calls all day and people say I sound clear. The noise cancellation also works on the mic side.',
      isOfficial: false,
    });

    // Questions for Smartphone
    const q5 = await ProductQuestion.create({
      userId: customer1.id,
      productId: phone.id,
      question: 'Does this phone support wireless charging?',
    });

    await ProductAnswer.create({
      questionId: q5.id,
      userId: admin.id,
      answer: 'Yes! The Galaxy X Pro supports both wireless charging (15W) and reverse wireless charging (4.5W) to charge accessories.',
      isOfficial: true,
    });

    const q6 = await ProductQuestion.create({
      userId: customer2.id,
      productId: phone.id,
      question: 'Is the storage expandable with microSD?',
    });

    await ProductAnswer.create({
      questionId: q6.id,
      userId: admin.id,
      answer: 'No, this model does not have a microSD card slot. The 256GB internal storage is not expandable. We also offer a 512GB version if you need more space.',
      isOfficial: true,
    });

    // Questions for Earbuds
    const q7 = await ProductQuestion.create({
      userId: customer3.id,
      productId: earbuds.id,
      question: 'Are these good for running in the rain?',
    });

    await ProductAnswer.create({
      questionId: q7.id,
      userId: customer1.id,
      answer: 'Yes! They have IPX5 rating so they handle sweat and light rain with no issues. I run with them in all weather conditions.',
      isOfficial: false,
    });

    // Questions for Monitor
    const q8 = await ProductQuestion.create({
      userId: customer1.id,
      productId: monitor.id,
      question: 'Does this monitor have built-in speakers?',
    });

    await ProductAnswer.create({
      questionId: q8.id,
      userId: admin.id,
      answer: 'Yes, it has dual 5W built-in speakers. However, for the best audio experience, we recommend using external speakers or headphones.',
      isOfficial: true,
    });

    // Questions for Keyboard
    const q9 = await ProductQuestion.create({
      userId: customer2.id,
      productId: keyboard.id,
      question: 'Can I change the switches later?',
    });

    await ProductAnswer.create({
      questionId: q9.id,
      userId: customer3.id,
      answer: 'Yes! The hot-swappable sockets let you change switches without soldering. I swapped mine to brown switches and it took 10 minutes.',
      isOfficial: false,
    });

    // Questions for Smartwatch
    const q10 = await ProductQuestion.create({
      userId: customer1.id,
      productId: smartwatch.id,
      question: 'Does this work with iPhone or only Android?',
    });

    await ProductAnswer.create({
      questionId: q10.id,
      userId: admin.id,
      answer: 'The FitPro Max works with both iPhone (iOS 13+) and Android (8.0+) devices via the FitPro app available on both App Store and Google Play.',
      isOfficial: true,
    });

    logger.info('✅ Questions and answers seeded.');

    // ========================================
    // 6. CREATE COUPONS
    // ========================================
    logger.info('Creating coupons...');

    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10.00,
      minimumOrderAmount: 50.00,
      maxDiscountAmount: 100.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    await Coupon.create({
      code: 'TECHSALE15',
      discountType: 'PERCENTAGE',
      discountValue: 15.00,
      minimumOrderAmount: 100.00,
      maxDiscountAmount: 200.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      isActive: true,
    });

    logger.info('✅ Coupons seeded.');

    // ========================================
    // UPDATE PRODUCT REVIEW COUNTS
    // ========================================
    logger.info('Updating product review counts...');

    await Product.update({ totalReviews: 3, averageRating: 4.7 }, { where: { id: laptop.id } });
    await Product.update({ totalReviews: 3, averageRating: 4.7 }, { where: { id: headphones.id } });
    await Product.update({ totalReviews: 2, averageRating: 4.5 }, { where: { id: phone.id } });
    await Product.update({ totalReviews: 2, averageRating: 4.5 }, { where: { id: earbuds.id } });
    await Product.update({ totalReviews: 1, averageRating: 5.0 }, { where: { id: monitor.id } });
    await Product.update({ totalReviews: 2, averageRating: 4.5 }, { where: { id: keyboard.id } });
    await Product.update({ totalReviews: 1, averageRating: 5.0 }, { where: { id: smartwatch.id } });

    logger.info('✅ Product stats updated.');

    logger.info('');
    logger.info('🎉🎉🎉 ENHANCED DATABASE SEEDING COMPLETED! 🎉🎉🎉');
    logger.info('');
    logger.info('📊 Summary:');
    logger.info('   - 5 Users (1 Super Admin, 1 Admin, 3 Customers)');
    logger.info('   - 6 Categories');
    logger.info('   - 10 Products with variants and inventory');
    logger.info('   - 13 Product Reviews');
    logger.info('   - 10 Questions with 12 Answers');
    logger.info('   - 3 Active Coupons');
    logger.info('');
    logger.info('🔐 Test Credentials:');
    logger.info('   Super Admin: superadmin@amazon.com / SuperAdmin123!');
    logger.info('   Admin: admin@amazon.com / Admin123!');
    logger.info('   Customer: customer@amazon.com / Customer123!');
    logger.info('');
    logger.info('✅ Ready to test!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
