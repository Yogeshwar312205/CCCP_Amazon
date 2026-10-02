const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Inventory = sequelize.define('inventory', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id',
  },
  variantId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    unique: true,
    field: 'variant_id',
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'stock_quantity',
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    field: 'low_stock_threshold',
  },
  reorderPoint: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    field: 'reorder_point',
  },
}, {
  tableName: 'inventory',
  indexes: [
    { fields: ['product_id'] },
    { unique: true, fields: ['variant_id'] },
  ],
});

module.exports = Inventory;
