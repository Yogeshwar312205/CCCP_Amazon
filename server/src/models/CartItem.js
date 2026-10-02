const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CartItem = sequelize.define('cart_items', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  cartId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'cart_id',
  },
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id',
  },
  variantId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'variant_id',
  },
  quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'cart_items',
  indexes: [
    { fields: ['cart_id'] },
    { fields: ['product_id'] },
    { unique: true, fields: ['cart_id', 'product_id', 'variant_id'] },
  ],
});

module.exports = CartItem;
