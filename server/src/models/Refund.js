const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Refund = sequelize.define('refunds', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  returnId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
    field: 'return_id',
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'order_id',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PROCESSED', 'FAILED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  processedBy: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'processed_by',
  },
  transactionReference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'transaction_reference',
  },
}, {
  tableName: 'refunds',
  indexes: [
    { unique: true, fields: ['return_id'] },
    { fields: ['order_id'] },
  ],
});

module.exports = Refund;
