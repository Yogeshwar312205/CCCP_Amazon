const sequelize = require('../../config/database');

async function backfillLegacyAdminOwnership() {
  const [superAdmins] = await sequelize.query(`
    SELECT id
    FROM users
    WHERE role = 'SUPER_ADMIN'
    ORDER BY id ASC
    LIMIT 1
  `);

  if (superAdmins.length === 0) return;

  const superAdminId = superAdmins[0].id;
  await sequelize.query(
    'UPDATE products SET created_by = :superAdminId WHERE created_by IS NULL',
    { replacements: { superAdminId } }
  );
  await sequelize.query(
    'UPDATE categories SET created_by = :superAdminId WHERE created_by IS NULL',
    { replacements: { superAdminId } }
  );
}

module.exports = backfillLegacyAdminOwnership;
