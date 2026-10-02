const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProductImage = sequelize.define('product_images', {
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
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'image_url',
  },
  altText: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'alt_text',
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_primary',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'display_order',
  },
}, {
  tableName: 'product_images',
  indexes: [
    { fields: ['product_id'] },
  ],
});

module.exports = ProductImage;
