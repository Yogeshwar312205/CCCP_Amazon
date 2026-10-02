const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ReviewImage = sequelize.define('review_images', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  reviewId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'review_id',
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'image_url',
  },
}, {
  tableName: 'review_images',
  indexes: [
    { fields: ['review_id'] },
  ],
});

module.exports = ReviewImage;
