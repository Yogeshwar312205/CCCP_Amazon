const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const WishlistItem = sequelize.define('wishlist_items', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  wishlistId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'wishlist_id',
  },
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id',
  },
}, {
  tableName: 'wishlist_items',
  indexes: [
    { fields: ['wishlist_id'] },
    { unique: true, fields: ['wishlist_id', 'product_id'] },
  ],
});

module.exports = WishlistItem;
