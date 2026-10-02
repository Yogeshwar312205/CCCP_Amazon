const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const OrderItem = sequelize.define('order_items', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'order_id',
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
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'product_name',
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',
  },
  quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'order_items',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['product_id'] },
  ],
});

module.exports = OrderItem;
