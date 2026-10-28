const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * CategoryCommission — Platform-Level Commission Rates per Category
 *
 * Super Admin configures commission rates by product category.
 * These are the platform defaults. A Shop.commissionRate overrides this
 * for that specific seller (used for negotiated seller deals).
 *
 * Commission resolution order:
 *   1. Shop.commissionRate (if not null) — seller-specific override
 *   2. CategoryCommission for the product's category (if exists)
 *   3. PlatformSettings.defaultCommissionRate (global fallback)
 */
const CategoryCommission = sequelize.define('category_commissions', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
    field: 'category_id',
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'commission_rate',
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Human-readable label e.g. "Electronics", "Fashion"',
  },
}, {
  tableName: 'category_commissions',
  indexes: [
    { unique: true, fields: ['category_id'] },
  ],
});

module.exports = CategoryCommission;
