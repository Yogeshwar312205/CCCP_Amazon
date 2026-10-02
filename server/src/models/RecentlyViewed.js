const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RecentlyViewed = sequelize.define('recently_viewed', {
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
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id',
  },
  viewedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'viewed_at',
  },
}, {
  tableName: 'recently_viewed',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['product_id'] },
    { unique: true, fields: ['user_id', 'product_id'] },
  ],
});

module.exports = RecentlyViewed;
