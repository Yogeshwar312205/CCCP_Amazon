const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
    field: 'order_id',
  },
  paymentMethod: {
    type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'PAYPAL', 'MOCK_GATEWAY'),
    allowNull: false,
    defaultValue: 'MOCK_GATEWAY',
    field: 'payment_method',
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'transaction_id',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  paymentGatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'payment_gateway_response',
  },
}, {
  tableName: 'payments',
  indexes: [
    { unique: true, fields: ['order_id'] },
    { unique: true, fields: ['transaction_id'] },
  ],
});

module.exports = Payment;
