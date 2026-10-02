const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Wishlist = sequelize.define('wishlists', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
    field: 'user_id',
  },
}, {
  tableName: 'wishlists',
  indexes: [
    { unique: true, fields: ['user_id'] },
  ],
});

module.exports = Wishlist;
