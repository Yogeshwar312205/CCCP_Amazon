const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CouponUsage = sequelize.define('coupon_usage', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  couponId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'coupon_id',
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'order_id',
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'used_at',
  },
}, {
  tableName: 'coupon_usage',
  indexes: [
    { fields: ['coupon_id'] },
    { fields: ['user_id'] },
    { fields: ['order_id'] },
  ],
});

module.exports = CouponUsage;
