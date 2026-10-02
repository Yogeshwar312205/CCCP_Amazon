const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProductQuestion = sequelize.define('product_questions', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'product_id',
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isAnswered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_answered',
  },
}, {
  tableName: 'product_questions',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['user_id'] },
  ],
});

module.exports = ProductQuestion;
