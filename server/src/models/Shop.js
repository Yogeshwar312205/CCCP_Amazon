const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Shop = sequelize.define('shops', {
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
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(180),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  logoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'logo_url',
  },
  bannerUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'banner_url',
  },
  // KYC Fields
  businessRegNo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'business_reg_no',
  },
  taxId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'tax_id',
  },
  // Stored as JSON — contains bank name, account number, routing number
  // NOTE: This is NOT encrypted in the current implementation (payments are mocked).
  //       Encrypt this field before going live with real payouts.
  bankAccountInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'bank_account_info',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
  },
  // Per-seller commission override. If NULL, falls back to CategoryCommission table.
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'commission_rate',
  },
  // Funds held post-purchase, pre-return-window expiry
  escrowBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'escrow_balance',
  },
  // Funds cleared and ready for payout withdrawal
  availableBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'available_balance',
  },
  // Denormalized metrics for quick kill-switch evaluation
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'average_rating',
  },
  totalOrders: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    field: 'total_orders',
  },
  refundRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'refund_rate',
  },
}, {
  tableName: 'shops',
  indexes: [
    { unique: true, fields: ['user_id'] },
    { unique: true, fields: ['name'] },
    { unique: true, fields: ['slug'] },
    { fields: ['status'] },
  ],
});

module.exports = Shop;
