const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Return = sequelize.define('returns', {
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
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'ITEM_RECEIVED', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'REQUESTED',
  },
}, {
  tableName: 'returns',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Return;
