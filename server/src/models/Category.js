const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Category = sequelize.define('categories', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url',
  },
  parentId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'parent_id',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'display_order',
  },
  createdBy: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'created_by',
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'categories',
  indexes: [
    { unique: true, fields: ['slug'] },
    { fields: ['parent_id'] },
    { fields: ['created_by'] },
  ],
});

module.exports = Category;
