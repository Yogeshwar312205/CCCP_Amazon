const sequelize = require('../../config/database');
const User = require('./User');
const Address = require('./Address');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');
const ProductAttribute = require('./ProductAttribute');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Wishlist = require('./Wishlist');
const WishlistItem = require('./WishlistItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Inventory = require('./Inventory');
const InventoryTransaction = require('./InventoryTransaction');
const Review = require('./Review');
const ReviewImage = require('./ReviewImage');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const ProductQuestion = require('./ProductQuestion');
const ProductAnswer = require('./ProductAnswer');
const RecentlyViewed = require('./RecentlyViewed');
const Notification = require('./Notification');
const Return = require('./Return');
const Refund = require('./Refund');
const AuditLog = require('./AuditLog');
// Multi-vendor marketplace models
const Shop = require('./Shop');
const SellerOrder = require('./SellerOrder');
const ProductBoost = require('./ProductBoost');
const CategoryCommission = require('./CategoryCommission');
const PlatformSettings = require('./PlatformSettings');

// 1. User Associations
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Wishlist, { foreignKey: 'user_id', as: 'wishlist', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

User.hasMany(CouponUsage, { foreignKey: 'user_id', as: 'couponUsages', onDelete: 'CASCADE' });
CouponUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ProductQuestion, { foreignKey: 'user_id', as: 'questions', onDelete: 'CASCADE' });
ProductQuestion.belongsTo(User, { foreignKey: 'user_id', as: 'asker' });

User.hasMany(ProductAnswer, { foreignKey: 'user_id', as: 'answers', onDelete: 'CASCADE' });
ProductAnswer.belongsTo(User, { foreignKey: 'user_id', as: 'answerer' });

User.hasMany(RecentlyViewed, { foreignKey: 'user_id', as: 'recentlyViewed', onDelete: 'CASCADE' });
RecentlyViewed.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 2. Category Associations
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories', onDelete: 'SET NULL' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 3. Product Associations
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductAttribute, { foreignKey: 'product_id', as: 'attributes', onDelete: 'CASCADE' });
ProductAttribute.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasOne(Inventory, { foreignKey: 'product_id', as: 'inventory', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

ProductVariant.hasOne(Inventory, { foreignKey: 'variant_id', as: 'inventory', onDelete: 'CASCADE' });
Inventory.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

Inventory.hasMany(InventoryTransaction, { foreignKey: 'inventory_id', as: 'transactions', onDelete: 'CASCADE' });
InventoryTransaction.belongsTo(Inventory, { foreignKey: 'inventory_id', as: 'inventory' });
InventoryTransaction.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Review.hasMany(ReviewImage, { foreignKey: 'review_id', as: 'images', onDelete: 'CASCADE' });
ReviewImage.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });

Product.hasMany(ProductQuestion, { foreignKey: 'product_id', as: 'questions', onDelete: 'CASCADE' });
ProductQuestion.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

ProductQuestion.hasMany(ProductAnswer, { foreignKey: 'question_id', as: 'answers', onDelete: 'CASCADE' });
ProductAnswer.belongsTo(ProductQuestion, { foreignKey: 'question_id', as: 'question' });

Product.hasMany(RecentlyViewed, { foreignKey: 'product_id', as: 'views', onDelete: 'CASCADE' });
RecentlyViewed.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 4. Cart & Wishlist Associations
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product', onDelete: 'CASCADE' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant', onDelete: 'SET NULL' });

Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlist_id', as: 'items', onDelete: 'CASCADE' });
WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlist_id', as: 'wishlist' });
WishlistItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product', onDelete: 'CASCADE' });

// 5. Order & Payment Associations
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product', onDelete: 'RESTRICT' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant', onDelete: 'SET NULL' });

Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.belongsTo(Address, { foreignKey: 'shipping_address_id', as: 'shippingAddress', onDelete: 'SET NULL' });
Order.belongsTo(Address, { foreignKey: 'billing_address_id', as: 'billingAddress', onDelete: 'SET NULL' });

Order.hasMany(Return, { foreignKey: 'order_id', as: 'returns', onDelete: 'RESTRICT' });
Return.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Return.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Return.hasOne(Refund, { foreignKey: 'return_id', as: 'refund', onDelete: 'CASCADE' });
Refund.belongsTo(Return, { foreignKey: 'return_id', as: 'return' });

Refund.belongsTo(Order, { foreignKey: 'order_id', as: 'order', onDelete: 'RESTRICT' });
Refund.belongsTo(User, { foreignKey: 'processed_by', as: 'processor', onDelete: 'SET NULL' });

// 6. Coupon Associations
Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'usages', onDelete: 'CASCADE' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
CouponUsage.belongsTo(Order, { foreignKey: 'order_id', as: 'order', onDelete: 'CASCADE' });

// ─── MULTI-VENDOR MARKETPLACE ASSOCIATIONS ────────────────────────────────────

// 7. Shop Associations
User.hasOne(Shop, { foreignKey: 'user_id', as: 'shop', onDelete: 'RESTRICT' });
Shop.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

Shop.hasMany(Product, { foreignKey: 'shop_id', as: 'products', onDelete: 'RESTRICT' });
Product.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

// 8. SellerOrder Associations
Order.hasMany(SellerOrder, { foreignKey: 'order_id', as: 'sellerOrders', onDelete: 'CASCADE' });
SellerOrder.belongsTo(Order, { foreignKey: 'order_id', as: 'masterOrder' });

Shop.hasMany(SellerOrder, { foreignKey: 'shop_id', as: 'sellerOrders', onDelete: 'RESTRICT' });
SellerOrder.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

SellerOrder.hasMany(OrderItem, { foreignKey: 'seller_order_id', as: 'items' });
OrderItem.belongsTo(SellerOrder, { foreignKey: 'seller_order_id', as: 'sellerOrder' });

// 9. ProductBoost Associations
Shop.hasMany(ProductBoost, { foreignKey: 'shop_id', as: 'boosts', onDelete: 'CASCADE' });
ProductBoost.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

Product.hasMany(ProductBoost, { foreignKey: 'product_id', as: 'boosts', onDelete: 'CASCADE' });
ProductBoost.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// 10. CategoryCommission Associations
Category.hasOne(CategoryCommission, { foreignKey: 'category_id', as: 'commission', onDelete: 'CASCADE' });
CategoryCommission.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  sequelize,
  User,
  Address,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  ProductAttribute,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  Payment,
  Inventory,
  InventoryTransaction,
  Review,
  ReviewImage,
  Coupon,
  CouponUsage,
  ProductQuestion,
  ProductAnswer,
  RecentlyViewed,
  Notification,
  Return,
  Refund,
  AuditLog,
  // Multi-vendor marketplace
  Shop,
  SellerOrder,
  ProductBoost,
  CategoryCommission,
  PlatformSettings,
};
