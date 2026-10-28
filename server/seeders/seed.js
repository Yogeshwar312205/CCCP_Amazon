/**
 * CCCP_Amazon — Full Multi-Vendor Marketplace Seeder
 *
 * Seeds:
 *   - 1 Super Admin  (platform owner)
 *   - 1 Developer    (devops/engineering)
 *   - 10 Sellers     each with an approved Shop + 3-5 products
 *   - 3 Customers    with addresses, carts, wishlists
 *   - Platform settings + category commission rates
 *   - 2 Coupons
 *
 * Run:  node scripts/migrate.js --seed
 * Or:   node seeders/seed.js
 */

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
  Shop,
  CategoryCommission,
  PlatformSettings,
} = require('../src/models');
const logger = require('../config/logger');

// ─── Helper: create a product with one image and inventory ────────────────────
async function makeProduct({ shopId, categoryId, title, sku, brand, shortDesc, desc, basePrice, salePrice, imageUrl, stock, featured, rating, reviews, attrs }) {
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + `-${Math.random().toString(36).substring(2, 5)}`;
  const p = await Product.create({
    shopId,
    categoryId,
    title,
    slug,
    sku,
    brand,
    shortDescription: shortDesc,
    description: desc,
    basePrice,
    salePrice: salePrice || null,
    isFeatured: featured || false,
    isActive: true,
    averageRating: rating || 0,
    totalReviews: reviews || 0,
  });
  await ProductImage.create({ productId: p.id, imageUrl, altText: title, isPrimary: true, displayOrder: 1 });
  const inv = await Inventory.create({ productId: p.id, variantId: null, stockQuantity: stock, lowStockThreshold: 5 });
  if (attrs) {
    await ProductAttribute.bulkCreate(attrs.map(([k, v]) => ({ productId: p.id, attributeKey: k, attributeValue: v })));
  }
  return p;
}

// ─── Helper: create seller user + shop ────────────────────────────────────────
async function makeSeller({ firstName, lastName, email, password, shopName, shopDesc, businessRegNo, taxId }) {
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, password: hash, role: 'SELLER', isActive: true });
  await Cart.create({ userId: user.id });
  await Wishlist.create({ userId: user.id });
  const slug = shopName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const shop = await Shop.create({
    userId: user.id,
    name: shopName,
    slug,
    description: shopDesc,
    businessRegNo,
    taxId,
    bankAccountInfo: { bankName: 'Chase Bank', accountNumber: '****' + Math.floor(1000 + Math.random() * 9000), routingNumber: '021000021' },
    status: 'ACTIVE',
    commissionRate: null, // uses category defaults
    escrowBalance: 0,
    availableBalance: 0,
    averageRating: (3.8 + Math.random() * 1.2).toFixed(2),
    totalOrders: Math.floor(20 + Math.random() * 200),
    refundRate: (Math.random() * 3).toFixed(2),
  });
  return { user, shop };
}

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting multi-vendor marketplace seeding...');

    // Wipe and recreate all tables
    await sequelize.sync({ force: true });
    logger.info('✓ Schema wiped and recreated.');

    // ── 1. Platform Settings ─────────────────────────────────────────────────
    await PlatformSettings.create({
      id: 1,
      defaultCommissionRate: 10.00,
      escrowReturnWindowDays: 7,
      maxBoostProductsPer10: 2,
      autoSuspendRefundRateThreshold: 5.00,
    });
    logger.info('✓ Platform settings created.');

    // ── 2. Super Admin ────────────────────────────────────────────────────────
    const superAdminHash = await bcrypt.hash('SuperAdmin123!', 10);
    const superAdmin = await User.create({
      firstName: 'Platform',
      lastName: 'Owner',
      email: 'superadmin@cccp.com',
      phone: '+18005550001',
      password: superAdminHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    });
    logger.info('✓ Super Admin created.');

    // ── 3. Developer ──────────────────────────────────────────────────────────
    const devHash = await bcrypt.hash('DevOps123!', 10);
    const developer = await User.create({
      firstName: 'Dev',
      lastName: 'Engineer',
      email: 'dev@cccp.com',
      phone: '+18005550010',
      password: devHash,
      role: 'DEVELOPER',
      isActive: true,
    });
    logger.info('✓ Developer created.');

    // ── 4. Categories ─────────────────────────────────────────────────────────
    const electronics = await Category.create({ name: 'Electronics', slug: 'electronics', description: 'Gadgets, phones, audio and smart home', displayOrder: 1 });
    const computers   = await Category.create({ name: 'Computers & Laptops', slug: 'computers-laptops', description: 'Laptops, desktops, monitors', parentId: electronics.id, displayOrder: 1 });
    const audio       = await Category.create({ name: 'Headphones & Audio', slug: 'headphones-audio', description: 'Earbuds, headphones, speakers', parentId: electronics.id, displayOrder: 2 });
    const phones      = await Category.create({ name: 'Smartphones', slug: 'smartphones', description: 'Flagship and mid-range smartphones', parentId: electronics.id, displayOrder: 3 });
    const fashion     = await Category.create({ name: 'Fashion & Apparel', slug: 'fashion-apparel', description: 'Clothing and accessories', displayOrder: 2 });
    const mensWear    = await Category.create({ name: "Men's Clothing", slug: 'mens-clothing', description: 'Shirts, trousers, jackets', parentId: fashion.id, displayOrder: 1 });
    const womensWear  = await Category.create({ name: "Women's Clothing", slug: 'womens-clothing', description: 'Dresses, tops, bags', parentId: fashion.id, displayOrder: 2 });
    const homeKitchen = await Category.create({ name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Appliances, cookware, decor', displayOrder: 3 });
    const fitness     = await Category.create({ name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Gym equipment and sportswear', displayOrder: 4 });
    const books       = await Category.create({ name: 'Books', slug: 'books', description: 'Fiction, non-fiction, educational', displayOrder: 5 });

    logger.info('✓ Categories created.');

    // ── 5. Category Commission Rates ──────────────────────────────────────────
    await CategoryCommission.bulkCreate([
      { categoryId: electronics.id, commissionRate: 8.00,  label: 'Electronics' },
      { categoryId: computers.id,   commissionRate: 8.00,  label: 'Computers' },
      { categoryId: audio.id,       commissionRate: 8.00,  label: 'Audio' },
      { categoryId: phones.id,      commissionRate: 8.00,  label: 'Smartphones' },
      { categoryId: fashion.id,     commissionRate: 15.00, label: 'Fashion' },
      { categoryId: mensWear.id,    commissionRate: 15.00, label: "Men's Fashion" },
      { categoryId: womensWear.id,  commissionRate: 15.00, label: "Women's Fashion" },
      { categoryId: homeKitchen.id, commissionRate: 12.00, label: 'Home & Kitchen' },
      { categoryId: fitness.id,     commissionRate: 10.00, label: 'Sports & Fitness' },
      { categoryId: books.id,       commissionRate: 5.00,  label: 'Books' },
    ]);
    logger.info('✓ Category commissions configured.');

    // ── 6. Ten Sellers & Their Shops ──────────────────────────────────────────

    // SELLER 1 — TechVault (Electronics)
    const { shop: techVault } = await makeSeller({
      firstName: 'Alex', lastName: 'Rivera', email: 'seller1@cccp.com', password: 'Seller123!',
      shopName: 'TechVault', shopDesc: 'Premium electronics at unbeatable prices.',
      businessRegNo: 'BRN-TV-001', taxId: 'EIN-12-3456789',
    });
    await makeProduct({ shopId: techVault.id, categoryId: computers.id, title: 'EchoBook Pro 16 - M3 Max, 36GB, 1TB', sku: 'TV-ECHO-PRO-16', brand: 'EchoBook', shortDesc: 'Ultra-fast pro laptop.', desc: 'The EchoBook Pro 16 delivers groundbreaking performance. M3 Max chip, 16-inch Liquid Retina XDR display, 22-hour battery.', basePrice: 2499.99, salePrice: 2299.99, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', stock: 15, featured: true, rating: 4.8, reviews: 47, attrs: [['CPU','M3 Max'],['RAM','36GB'],['Storage','1TB SSD'],['Display','16.2" Retina XDR']] });
    await makeProduct({ shopId: techVault.id, categoryId: computers.id, title: 'UltraSlim 14 Business Laptop - Intel i7', sku: 'TV-ULTRA-14', brand: 'UltraSlim', shortDesc: 'Featherlight business powerhouse.', desc: '14-inch FHD IPS display, Intel Core i7-1360P, 16GB LPDDR5, 512GB NVMe. Perfect for professionals on the move.', basePrice: 1299.99, salePrice: 999.99, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', stock: 22, rating: 4.5, reviews: 31 });
    await makeProduct({ shopId: techVault.id, categoryId: phones.id, title: 'Nova X15 Pro Smartphone - 256GB', sku: 'TV-NOVAX15', brand: 'Nova', shortDesc: 'Flagship camera system, 5G ready.', desc: 'Triple-camera 200MP system, Snapdragon 8 Gen 3, 6.7" AMOLED 144Hz, 5000mAh battery with 100W fast charging.', basePrice: 999.99, salePrice: 849.99, imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', stock: 30, featured: true, rating: 4.7, reviews: 89 });
    await makeProduct({ shopId: techVault.id, categoryId: phones.id, title: 'Spark 12 Budget Smartphone - 128GB', sku: 'TV-SPARK12', brand: 'Spark', shortDesc: 'Great performance, affordable price.', desc: 'MediaTek Dimensity 8200, 6.5" AMOLED, 50MP camera, 4500mAh, Android 14.', basePrice: 299.99, imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800', stock: 50, rating: 4.2, reviews: 23 });

    // SELLER 2 — SoundWave (Audio)
    const { shop: soundWave } = await makeSeller({
      firstName: 'Priya', lastName: 'Sharma', email: 'seller2@cccp.com', password: 'Seller123!',
      shopName: 'SoundWave Store', shopDesc: 'Audiophile-grade sound for everyone.',
      businessRegNo: 'BRN-SW-002', taxId: 'GST-29ABCDE1234F1Z5',
    });
    await makeProduct({ shopId: soundWave.id, categoryId: audio.id, title: 'SoundPulse ANC Pro - Noise Canceling Headphones', sku: 'SW-ANC-PRO', brand: 'SoundPulse', shortDesc: 'Industry-leading 45-hour ANC headphones.', desc: 'Custom 40mm drivers, multipoint Bluetooth 5.3, 45-hour playtime, plush memory foam. Best-in-class noise cancellation.', basePrice: 349.99, salePrice: 249.99, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', stock: 28, featured: true, rating: 4.9, reviews: 156 });
    await makeProduct({ shopId: soundWave.id, categoryId: audio.id, title: 'BassMax Sport Earbuds - True Wireless', sku: 'SW-BASS-MAX', brand: 'BassMax', shortDesc: 'IP68 waterproof workout earbuds.', desc: 'IP68 waterproof, 32-hour total battery, custom bass drivers, secure-fit sport ear tips, instant pairing.', basePrice: 129.99, salePrice: 89.99, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', stock: 45, rating: 4.5, reviews: 72 });
    await makeProduct({ shopId: soundWave.id, categoryId: audio.id, title: 'CrystalAir 360 Portable Speaker', sku: 'SW-CRYSTAL360', brand: 'CrystalAir', shortDesc: '360° surround sound in a compact form.', desc: '20W 360° omnidirectional speaker, IPX7 waterproof, 24-hour battery, built-in microphone, PartySync for 100+ speakers.', basePrice: 199.99, salePrice: 149.99, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800', stock: 35, rating: 4.6, reviews: 44 });
    await makeProduct({ shopId: soundWave.id, categoryId: audio.id, title: 'StudioPro Open-Back Headphones - HiFi', sku: 'SW-STUDIO-PRO', brand: 'StudioPro', shortDesc: 'Reference-grade sound for studio use.', desc: '250Ω impedance, open-back circumaural design, velour ear pads, detachable cable, audiophile-tuned 50mm drivers.', basePrice: 449.99, imageUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800', stock: 12, rating: 4.8, reviews: 29 });

    // SELLER 3 — FashionForward (Women's Fashion)
    const { shop: fashionFwd } = await makeSeller({
      firstName: 'Sofia', lastName: 'Chen', email: 'seller3@cccp.com', password: 'Seller123!',
      shopName: 'FashionForward', shopDesc: "Trendsetting women's fashion at fair prices.",
      businessRegNo: 'BRN-FF-003', taxId: 'VAT-GB123456789',
    });
    await makeProduct({ shopId: fashionFwd.id, categoryId: womensWear.id, title: 'Luxe Silk Wrap Dress - Floral Print', sku: 'FF-SILK-WRAP-001', brand: 'FashionForward', shortDesc: 'Elegant wrap dress for every occasion.', desc: 'Crafted from 100% pure silk, this floral wrap dress features a V-neckline, adjustable tie waist, and midi length. Available in 6 prints.', basePrice: 189.99, salePrice: 129.99, imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800', stock: 40, featured: true, rating: 4.7, reviews: 63 });
    await makeProduct({ shopId: fashionFwd.id, categoryId: womensWear.id, title: 'Urban Chic Blazer - Structured Fit', sku: 'FF-BLAZER-001', brand: 'FashionForward', shortDesc: 'Power dressing redefined.', desc: 'Premium wool blend blazer with structured shoulders, single-button closure, welt pockets. Perfect for boardroom to brunch.', basePrice: 149.99, salePrice: 109.99, imageUrl: 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=800', stock: 25, rating: 4.5, reviews: 38 });
    await makeProduct({ shopId: fashionFwd.id, categoryId: womensWear.id, title: 'Boho Maxi Skirt - Tiered Floral', sku: 'FF-MAXI-001', brand: 'FashionForward', shortDesc: 'Free-spirited tiered maxi skirt.', desc: 'Lightweight chiffon tiered skirt with floral print, elasticated waist, fully lined. Perfect for summer festivals and beach days.', basePrice: 79.99, imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5218a9b5a5?w=800', stock: 60, rating: 4.3, reviews: 21 });

    // SELLER 4 — ManStyle (Men's Fashion)
    const { shop: manStyle } = await makeSeller({
      firstName: 'James', lastName: 'Okafor', email: 'seller4@cccp.com', password: 'Seller123!',
      shopName: 'ManStyle Co.', shopDesc: "Premium menswear that doesn't break the bank.",
      businessRegNo: 'BRN-MS-004', taxId: 'EIN-98-7654321',
    });
    await makeProduct({ shopId: manStyle.id, categoryId: mensWear.id, title: 'Merino Crew-Neck Sweater - Slim Fit', sku: 'MS-MERINO-001', brand: 'ManStyle', shortDesc: '100% merino wool, perfect weight.', desc: 'Superfine 17.5-micron merino wool, ribbed cuffs and hem, seamless construction. Machine washable. The sweater you will wear every week.', basePrice: 119.99, salePrice: 89.99, imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800', stock: 35, featured: true, rating: 4.6, reviews: 48 });
    await makeProduct({ shopId: manStyle.id, categoryId: mensWear.id, title: 'Slim-Fit Chino Trousers - Navy', sku: 'MS-CHINO-NVY', brand: 'ManStyle', shortDesc: 'Versatile slim chinos in 8 colors.', desc: 'Stretch-cotton blend for comfort and movement. Flat-front slim cut, zip fly, two front slash pockets, two back welt pockets.', basePrice: 69.99, imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', stock: 55, rating: 4.4, reviews: 33 });
    await makeProduct({ shopId: manStyle.id, categoryId: mensWear.id, title: 'Oxford Button-Down Shirt - White', sku: 'MS-OXFORD-WHT', brand: 'ManStyle', shortDesc: 'Classic Oxford weave, always sharp.', desc: '100% American Pima cotton oxford weave. Tailored fit, button-down collar, single chest pocket, machine washable. A wardrobe essential.', basePrice: 59.99, salePrice: 44.99, imageUrl: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800', stock: 70, rating: 4.5, reviews: 57 });

    // SELLER 5 — HomeNest (Home & Kitchen)
    const { shop: homeNest } = await makeSeller({
      firstName: 'Maria', lastName: 'Gonzalez', email: 'seller5@cccp.com', password: 'Seller123!',
      shopName: 'HomeNest Living', shopDesc: 'Beautiful home goods that spark joy.',
      businessRegNo: 'BRN-HN-005', taxId: 'RFC-GOMA800101',
    });
    await makeProduct({ shopId: homeNest.id, categoryId: homeKitchen.id, title: 'AeroBreeze 5-Speed Ceramic Air Fryer 8QT', sku: 'HN-AF-8QT', brand: 'AeroBreeze', shortDesc: '8-quart family-size digital air fryer.', desc: 'TouchScreen 8QT air fryer with 6 preset programs (fry, roast, bake, grill, dehydrate, reheat). 80% less oil. Dishwasher-safe basket.', basePrice: 149.99, salePrice: 99.99, imageUrl: 'https://images.unsplash.com/photo-1614535700753-17e1c1c9cadb?w=800', stock: 40, featured: true, rating: 4.7, reviews: 92 });
    await makeProduct({ shopId: homeNest.id, categoryId: homeKitchen.id, title: 'Nordic Matte Ceramic Cookware Set - 10pc', sku: 'HN-CERAMIC-10', brand: 'HomeNest', shortDesc: 'Non-toxic ceramic non-stick set.', desc: '10-piece set: 2 fry pans, 2 saucepans, 1 sauté pan, 1 stock pot, 4 tempered glass lids. PFOA/PTFE free ceramic coating.', basePrice: 299.99, salePrice: 199.99, imageUrl: 'https://images.unsplash.com/photo-1585515656973-6e8a0d57bc98?w=800', stock: 18, rating: 4.8, reviews: 67 });
    await makeProduct({ shopId: homeNest.id, categoryId: homeKitchen.id, title: 'BrewMaster Pro Coffee Maker with Grinder', sku: 'HN-BREW-PRO', brand: 'BrewMaster', shortDesc: 'Bean-to-cup freshness every morning.', desc: 'Integrated burr grinder, 12-cup thermal carafe, programmable 24hr timer, strength control, bloom pause & pour. Keep-warm plate.', basePrice: 189.99, salePrice: 149.99, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', stock: 25, rating: 4.6, reviews: 44 });
    await makeProduct({ shopId: homeNest.id, categoryId: homeKitchen.id, title: 'LuxeComfort Memory Foam Pillow - Queen', sku: 'HN-PILLOW-Q', brand: 'LuxeComfort', shortDesc: 'Cooling gel memory foam pillow.', desc: 'Contour-cut cooling gel memory foam. Certipur-US certified. Breathable bamboo-rayon cover with zipper. Available in Standard, Queen, King.', basePrice: 89.99, salePrice: 59.99, imageUrl: 'https://images.unsplash.com/photo-1631248635783-17f8042cc7b7?w=800', stock: 50, rating: 4.5, reviews: 28 });

    // SELLER 6 — FitGear (Sports & Fitness)
    const { shop: fitGear } = await makeSeller({
      firstName: 'Chris', lastName: 'Thompson', email: 'seller6@cccp.com', password: 'Seller123!',
      shopName: 'FitGear Pro', shopDesc: 'Professional-grade fitness equipment for home.',
      businessRegNo: 'BRN-FG-006', taxId: 'EIN-55-1234567',
    });
    await makeProduct({ shopId: fitGear.id, categoryId: fitness.id, title: 'IronCore Adjustable Dumbbell Set 5-52.5lbs', sku: 'FG-ADJ-DUMB', brand: 'IronCore', shortDesc: 'Replace 15 dumbbells in one.', desc: 'Dial-adjust 5-52.5 lbs in 2.5lb increments. Trapezoidal metal handles, durable ABS housing. Includes two storage trays. Space-efficient home gym.', basePrice: 399.99, salePrice: 299.99, imageUrl: 'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800', stock: 20, featured: true, rating: 4.9, reviews: 134 });
    await makeProduct({ shopId: fitGear.id, categoryId: fitness.id, title: 'FlexMat Pro - 6mm Non-Slip Yoga Mat', sku: 'FG-YOGA-MAT', brand: 'FlexMat', shortDesc: 'Premium grip for every pose.', desc: 'Eco-friendly TPE foam, 6mm cushioning, moisture-wicking microfiber top layer, alignment lines, carry strap included. 72"×26" standard size.', basePrice: 79.99, salePrice: 54.99, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', stock: 60, rating: 4.6, reviews: 88 });
    await makeProduct({ shopId: fitGear.id, categoryId: fitness.id, title: 'SpeedRope Elite Jump Rope - Ball Bearings', sku: 'FG-ROPE-ELITE', brand: 'SpeedRope', shortDesc: 'Competition-grade speed rope.', desc: 'Precision ball-bearing handles, 4mm steel wire rope with PVC coating, aluminum-alloy handles. Adjustable cable length 9.8ft. Great for double-unders.', basePrice: 39.99, imageUrl: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=800', stock: 80, rating: 4.4, reviews: 52 });

    // SELLER 7 — NovaTech Phones (Smartphones)
    const { shop: novaTech } = await makeSeller({
      firstName: 'Kevin', lastName: 'Park', email: 'seller7@cccp.com', password: 'Seller123!',
      shopName: 'NovaTech Mobiles', shopDesc: 'Latest smartphones direct from distributors.',
      businessRegNo: 'BRN-NT-007', taxId: 'BRN-KR-1234567',
    });
    await makeProduct({ shopId: novaTech.id, categoryId: phones.id, title: 'Galaxy Ultra S25 - 512GB Phantom Black', sku: 'NT-GS25-512', brand: 'Galaxy', shortDesc: '200MP camera, 7-year OS support.', desc: 'Galaxy AI features, 200MP pro-grade camera system, Snapdragon 8 Elite, 6.9" QHD+ Dynamic AMOLED, titanium frame, 5000mAh 45W charging.', basePrice: 1299.99, salePrice: 1099.99, imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', stock: 20, featured: true, rating: 4.8, reviews: 77 });
    await makeProduct({ shopId: novaTech.id, categoryId: phones.id, title: 'Pixel 9 Pro - 256GB Obsidian', sku: 'NT-PIX9-256', brand: 'Pixel', shortDesc: 'Pure Android with Google AI built-in.', desc: 'Google Tensor G4, Gemini AI assistant, 50MP main + 48MP ultrawide + 48MP telephoto, 6.8" LTPO OLED, 7 years of Android updates.', basePrice: 1099.99, salePrice: 999.99, imageUrl: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800', stock: 18, rating: 4.7, reviews: 61 });
    await makeProduct({ shopId: novaTech.id, categoryId: phones.id, title: 'OnePlus 13 - 256GB Silky Black', sku: 'NT-OP13-256', brand: 'OnePlus', shortDesc: 'Flagship killer is back.', desc: 'Snapdragon 8 Elite, Hasselblad tuned triple camera, 6.82" 2K ProXDR display 120Hz, 6000mAh with 100W SuperVOOC charging.', basePrice: 899.99, salePrice: 799.99, imageUrl: 'https://images.unsplash.com/photo-1581795669633-91ef7c9699a8?w=800', stock: 25, rating: 4.6, reviews: 43 });

    // SELLER 8 — ReadMore Books
    const { shop: readMore } = await makeSeller({
      firstName: 'Emma', lastName: 'Watson', email: 'seller8@cccp.com', password: 'Seller123!',
      shopName: 'ReadMore Books', shopDesc: 'Curated books for every curious mind.',
      businessRegNo: 'BRN-RM-008', taxId: 'VAT-IE1234567T',
    });
    await makeProduct({ shopId: readMore.id, categoryId: books.id, title: 'Atomic Habits - James Clear (Hardcover)', sku: 'RM-ATOMIC-HC', brand: 'Penguin Random House', shortDesc: 'Tiny changes, remarkable results.', desc: 'The #1 New York Times bestseller. An easy & proven way to build good habits & break bad ones. Over 10 million copies sold worldwide.', basePrice: 27.99, salePrice: 19.99, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', stock: 150, featured: true, rating: 4.9, reviews: 420 });
    await makeProduct({ shopId: readMore.id, categoryId: books.id, title: 'The Psychology of Money - Morgan Housel', sku: 'RM-PSYCH-MONEY', brand: 'Harriman House', shortDesc: 'Timeless lessons on wealth and happiness.', desc: '19 short stories exploring the strange ways people think about money and how they can get better at it. 3M+ copies worldwide.', basePrice: 22.99, salePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800', stock: 200, rating: 4.8, reviews: 289 });
    await makeProduct({ shopId: readMore.id, categoryId: books.id, title: 'System Design Interview Vol. 1 & 2 Bundle', sku: 'RM-SDI-BUNDLE', brand: 'ByteByteGo', shortDesc: 'Master system design for FAANG interviews.', desc: 'The definitive guide to system design interviews. Vol 1 covers basic and intermediate designs; Vol 2 dives into insider guides for advanced topics.', basePrice: 59.99, salePrice: 44.99, imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800', stock: 80, rating: 4.9, reviews: 167 });

    // SELLER 9 — GlowUp Beauty
    const { shop: glowUp } = await makeSeller({
      firstName: 'Aisha', lastName: 'Patel', email: 'seller9@cccp.com', password: 'Seller123!',
      shopName: 'GlowUp Beauty', shopDesc: 'Clean, cruelty-free beauty essentials.',
      businessRegNo: 'BRN-GU-009', taxId: 'GSTIN-07AAAAA0000A1Z5',
    });
    await makeProduct({ shopId: glowUp.id, categoryId: homeKitchen.id, title: 'Rose Quartz Gua Sha + Jade Roller Set', sku: 'GU-GUASHA-SET', brand: 'GlowUp', shortDesc: 'Depuff and sculpt your face naturally.', desc: '100% authentic rose quartz gua sha stone and jade roller duo. Promotes lymphatic drainage, reduces puffiness, improves circulation. Vegan & cruelty-free.', basePrice: 49.99, salePrice: 34.99, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', stock: 75, featured: true, rating: 4.7, reviews: 112 });
    await makeProduct({ shopId: glowUp.id, categoryId: homeKitchen.id, title: 'Hyaluronic Acid Serum - 2oz Pure HA', sku: 'GU-HA-SERUM', brand: 'GlowUp', shortDesc: '72-hour hydration in every drop.', desc: 'Triple-molecular-weight hyaluronic acid, B5 vitamin, ceramides. Fragrance-free, non-comedogenic. Dermatologist tested. Suitable for all skin types.', basePrice: 39.99, salePrice: 27.99, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', stock: 90, rating: 4.8, reviews: 78 });
    await makeProduct({ shopId: glowUp.id, categoryId: homeKitchen.id, title: 'Vitamin C Brightening Face Wash', sku: 'GU-VTC-WASH', brand: 'GlowUp', shortDesc: 'Radiant skin, every morning.', desc: '15% stabilized L-ascorbic acid, niacinamide, green tea extract. Gentle sulfate-free formula. Brightens, evens skin tone, controls breakouts. 150ml.', basePrice: 24.99, imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800', stock: 110, rating: 4.6, reviews: 55 });

    // SELLER 10 — GadgetDen (Smart Home / Electronics)
    const { shop: gadgetDen } = await makeSeller({
      firstName: 'Liam', lastName: 'Murphy', email: 'seller10@cccp.com', password: 'Seller123!',
      shopName: 'GadgetDen', shopDesc: 'Smart home and IoT gadgets you actually need.',
      businessRegNo: 'BRN-GD-010', taxId: 'CRO-99-9876543',
    });
    await makeProduct({ shopId: gadgetDen.id, categoryId: electronics.id, title: 'SmartHome Hub X3 - Matter & Thread', sku: 'GD-HUB-X3', brand: 'GadgetDen', shortDesc: 'Control all your smart devices from one hub.', desc: 'Compatible with Matter, Thread, Zigbee, Z-Wave, Bluetooth 5.2, Wi-Fi 6. Controls up to 500 devices. No subscription needed. Privacy-first local processing.', basePrice: 129.99, salePrice: 99.99, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', stock: 30, featured: true, rating: 4.7, reviews: 63 });
    await makeProduct({ shopId: gadgetDen.id, categoryId: electronics.id, title: '4K Outdoor Security Camera - Wired PoE', sku: 'GD-CAM-4K-POE', brand: 'GadgetDen', shortDesc: '4K 24/7 recording with AI detection.', desc: '4K@30fps UHD lens, 130° wide angle, color night vision 100ft, AI human + vehicle detection, H.265+ compression, IP67 weatherproof, PoE powered.', basePrice: 89.99, salePrice: 69.99, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', stock: 40, rating: 4.5, reviews: 38 });
    await makeProduct({ shopId: gadgetDen.id, categoryId: electronics.id, title: 'NanoTrack GPS Pet Tracker - No Monthly Fee', sku: 'GD-GPS-PET', brand: 'NanoTrack', shortDesc: 'Real-time GPS for dogs & cats.', desc: 'LTE-M network, 5-day battery, 100% waterproof IPX8, activity tracking, escape alert, lightweight 9g. No monthly subscription ever.', basePrice: 59.99, salePrice: 47.99, imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', stock: 55, rating: 4.4, reviews: 29 });

    logger.info('✓ 10 sellers and their shops + products seeded.');

    // ── 7. Customers ─────────────────────────────────────────────────────────
    const customers = [
      { firstName: 'John',  lastName: 'Doe',     email: 'customer@cccp.com',   password: 'Customer123!', phone: '+18005550003', city: 'Seattle',     state: 'WA', zip: '98101' },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@cccp.com',       password: 'Customer123!', phone: '+18005550004', city: 'New York',    state: 'NY', zip: '10001' },
      { firstName: 'Mike',  lastName: 'Chen',    email: 'mike@cccp.com',        password: 'Customer123!', phone: '+18005550005', city: 'San Francisco', state: 'CA', zip: '94102' },
    ];

    for (const c of customers) {
      const hash = await bcrypt.hash(c.password, 10);
      const user = await User.create({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, password: hash, role: 'CUSTOMER', isActive: true });
      await Cart.create({ userId: user.id });
      await Wishlist.create({ userId: user.id });
      await Address.create({ userId: user.id, fullName: `${c.firstName} ${c.lastName}`, streetAddress: '123 Main Street', city: c.city, state: c.state, postalCode: c.zip, country: 'USA', phone: c.phone, isDefaultShipping: true, isDefaultBilling: true, type: 'BOTH' });
    }
    logger.info('✓ 3 customers seeded.');

    // ── 8. Coupons ────────────────────────────────────────────────────────────
    await Coupon.bulkCreate([
      { code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10.00, minimumOrderAmount: 50.00, maxDiscountAmount: 100.00, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 500, usageCount: 0, isActive: true },
      { code: 'SAVEMORE20', discountType: 'FIXED_AMOUNT', discountValue: 20.00, minimumOrderAmount: 150.00, startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 200, usageCount: 0, isActive: true },
      { code: 'NEWSHOP15', discountType: 'PERCENTAGE', discountValue: 15.00, minimumOrderAmount: 75.00, maxDiscountAmount: 50.00, startDate: new Date(), endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), usageLimit: 300, usageCount: 0, isActive: true },
    ]);
    logger.info('✓ Coupons seeded.');

    // ── Done ──────────────────────────────────────────────────────────────────
    const productCount = await Product.count();
    const shopCount    = await Shop.count();
    const userCount    = await User.count();

    logger.info(`\n🎉 Seeding complete!`);
    logger.info(`   Users: ${userCount} | Shops: ${shopCount} | Products: ${productCount}`);

    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
