const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Cart = sequelize.define('carts', {
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
  tableName: 'carts',
  indexes: [
    { unique: true, fields: ['user_id'] },
  ],
});

module.exports = Cart;
