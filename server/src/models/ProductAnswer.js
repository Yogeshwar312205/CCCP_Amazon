const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ProductAnswer = sequelize.define('product_answers', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  questionId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'question_id',
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'user_id',
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isAdminAnswer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_admin_answer',
  },
}, {
  tableName: 'product_answers',
  indexes: [
    { fields: ['question_id'] },
    { fields: ['user_id'] },
  ],
});

module.exports = ProductAnswer;
