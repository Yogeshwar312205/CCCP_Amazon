const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AuditLog = sequelize.define('audit_logs', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'user_id',
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type',
  },
  entityId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'entity_id',
  },
  oldValues: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'old_values',
  },
  newValues: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'new_values',
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'user_agent',
  },
}, {
  tableName: 'audit_logs',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
  ],
});

module.exports = AuditLog;
