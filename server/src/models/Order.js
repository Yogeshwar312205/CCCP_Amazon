const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'order_number',
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  shippingAddressId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'shipping_address_id',
  },
  billingAddressId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'billing_address_id',
  },
  shippingAddressSnapshot: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'shipping_address_snapshot',
  },
  subtotalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'subtotal_amount',
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'discount_amount',
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'shipping_fee',
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'tax_amount',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'),
    allowNull: false,
    defaultValue: 'PENDING',
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
  placedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'placed_at',
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'shipped_at',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
  },
}, {
  tableName: 'orders',
  indexes: [
    { unique: true, fields: ['order_number'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['placed_at'] },
  ],
});

module.exports = Order;
