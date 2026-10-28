const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * ProductBoost — Sponsored Product Placement
 *
 * Sellers submit boost requests specifying a budget and duration.
 * Super Admin reviews and approves/rejects.
 * Approved boosts set Product.isBoosted = true and raise the product's
 * search ranking score via a boost multiplier in product.service.js.
 */
const ProductBoost = sequelize.define('product_boosts', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  shopId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'shop_id',
  },
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id',
  },
  // Ad spend budget committed by the seller
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  // Ranking weight multiplier — used in product.service.js sort formula
  boostFactor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
    field: 'boost_factor',
  },
  status: {
    type: DataTypes.ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'REQUESTED',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date',
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date',
  },
}, {
  tableName: 'product_boosts',
  indexes: [
    { fields: ['shop_id'] },
    { fields: ['product_id'] },
    { fields: ['status'] },
    { fields: ['end_date'] },
  ],
});

module.exports = ProductBoost;
