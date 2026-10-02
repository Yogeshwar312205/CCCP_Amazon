const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Notification = sequelize.define('notifications', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('ORDER_STATUS', 'LOW_STOCK', 'OUT_OF_STOCK', 'PRICE_DROP', 'SYSTEM'),
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_read',
  },
  link: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  indexes: [
    { fields: ['user_id', 'is_read'] },
  ],
});

module.exports = Notification;
