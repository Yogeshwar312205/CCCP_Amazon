const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Address = sequelize.define('addresses', {
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
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name',
  },
  streetAddress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'street_address',
  },
  apartmentSuite: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'apartment_suite',
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'postal_code',
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'USA',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  isDefaultShipping: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_default_shipping',
  },
  isDefaultBilling: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_default_billing',
  },
  type: {
    type: DataTypes.ENUM('SHIPPING', 'BILLING', 'BOTH'),
    allowNull: false,
    defaultValue: 'SHIPPING',
  },
}, {
  tableName: 'addresses',
  indexes: [
    { fields: ['user_id'] },
  ],
});

module.exports = Address;
