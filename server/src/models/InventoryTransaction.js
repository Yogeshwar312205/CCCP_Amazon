const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const InventoryTransaction = sequelize.define('inventory_transactions', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  inventoryId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'inventory_id',
  },
  quantityChange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity_change',
  },
  type: {
    type: DataTypes.ENUM('PURCHASE', 'RESTOCK', 'RETURN_RESTOCK', 'ADJUSTMENT', 'DAMAGE'),
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reference_id',
  },
  performedBy: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'performed_by',
  },
  notes: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'inventory_transactions',
  indexes: [
    { fields: ['inventory_id'] },
    { fields: ['performed_by'] },
  ],
});

module.exports = InventoryTransaction;
