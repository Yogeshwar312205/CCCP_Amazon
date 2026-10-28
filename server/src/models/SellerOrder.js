const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * SellerOrder — Sub-Order per Shop
 *
 * When a customer places an order containing items from multiple shops,
 * one SellerOrder is created per shop. This is what the seller sees and acts on.
 * The parent Order is the customer-facing master record.
 */
const SellerOrder = sequelize.define('seller_orders', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'order_id',
  },
  shopId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'shop_id',
  },
  // Sum of (unitPrice × quantity) for all items from this shop
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // subtotal × (shop.commissionRate / 100) — retained by platform
  platformFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'platform_fee',
  },
  // subtotal - platformFee — goes to seller
  sellerEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'seller_earnings',
  },
  status: {
    type: DataTypes.ENUM(
      'PROCESSING',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'REFUNDED'
    ),
    allowNull: false,
    defaultValue: 'PROCESSING',
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tracking_number',
  },
  carrier: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  // Set to true once sellerEarnings are moved from escrow → availableBalance
  payoutSettled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'payout_settled',
  },
  // Timestamp when the escrow window expired and funds were released
  escrowReleasedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'escrow_released_at',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
  },
}, {
  tableName: 'seller_orders',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['shop_id'] },
    { fields: ['status'] },
    { fields: ['payout_settled'] },
  ],
});

module.exports = SellerOrder;
