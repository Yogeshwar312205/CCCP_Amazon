const sequelize = require('../../config/database');

async function ensureCategoryOwnershipColumn() {
  const [columns] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'categories'
      AND COLUMN_NAME = 'created_by'
  `);

  if (columns.length === 0) {
    await sequelize.query('ALTER TABLE categories ADD COLUMN created_by BIGINT UNSIGNED NULL');
  }

  const [indexes] = await sequelize.query(`
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'categories'
      AND INDEX_NAME = 'categories_created_by'
  `);

  if (indexes.length === 0) {
    await sequelize.query('ALTER TABLE categories ADD INDEX categories_created_by (created_by)');
  }
}

module.exports = ensureCategoryOwnershipColumn;
