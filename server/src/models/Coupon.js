const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Coupon = sequelize.define('coupons', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  discountType: {
    type: DataTypes.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
    allowNull: false,
    field: 'discount_type',
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_value',
  },
  minimumOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'minimum_order_amount',
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_discount_amount',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date',
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date',
  },
  usageLimit: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    field: 'usage_limit',
  },
  usageCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    field: 'usage_count',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'coupons',
  indexes: [
    { unique: true, fields: ['code'] },
    { fields: ['is_active', 'start_date', 'end_date'] },
  ],
});

module.exports = Coupon;
