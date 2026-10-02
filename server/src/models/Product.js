const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Product = sequelize.define('products', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'category_id',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(280),
    allowNull: false,
    unique: true,
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'short_description',
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'base_price',
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'sale_price',
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_featured',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'average_rating',
  },
  totalReviews: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    field: 'total_reviews',
  },
}, {
  tableName: 'products',
  indexes: [
    { unique: true, fields: ['slug'] },
    { unique: true, fields: ['sku'] },
    { fields: ['category_id'] },
    { fields: ['brand'] },
    { fields: ['is_active', 'is_featured'] },
  ],
});

module.exports = Product;
