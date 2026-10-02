const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProductAttribute = sequelize.define('product_attributes', {
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
  attributeKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'attribute_key',
  },
  attributeValue: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'attribute_value',
  },
}, {
  tableName: 'product_attributes',
  indexes: [
    { fields: ['product_id'] },
  ],
});

module.exports = ProductAttribute;
