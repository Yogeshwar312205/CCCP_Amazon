const sequelize = require('../../config/database');

async function ensureProductOwnershipColumns() {
  const [columnRows] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'created_by'
  `);

  if (columnRows.length === 0) {
    await sequelize.query(`
      ALTER TABLE products
      ADD COLUMN created_by BIGINT UNSIGNED NULL
    `);
  }

  const [indexRows] = await sequelize.query(`
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND INDEX_NAME = 'products_created_by'
  `);

  if (indexRows.length === 0) {
    await sequelize.query(`
      ALTER TABLE products
      ADD INDEX products_created_by (created_by)
    `);
  }
}

module.exports = ensureProductOwnershipColumns;
