const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProductVariant = sequelize.define('product_variants', {
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
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  variantName: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'variant_name',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'stock_quantity',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'product_variants',
  indexes: [
    { fields: ['product_id'] },
    { unique: true, fields: ['sku'] },
  ],
});

module.exports = ProductVariant;
