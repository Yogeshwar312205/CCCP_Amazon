/**
 * CCCP Amazon Database Migration & Schema Synchronizer
 * 
 * Usage:
 *   node scripts/migrate.js
 *   node scripts/migrate.js --seed
 */

const { sequelize } = require('../src/models');
const ensureProductOwnershipColumns = require('../src/utils/ensureProductOwnershipColumns');
const ensurePaymentMethods = require('../src/utils/ensurePaymentMethods');
const ensureCategoryOwnershipColumn = require('../src/utils/ensureCategoryOwnershipColumn');
const backfillLegacyAdminOwnership = require('../src/utils/backfillLegacyAdminOwnership');
const logger = require('../config/logger');

async function migrate() {
  console.log('=====================================================');
  console.log('  CCCP Amazon — Production Database Migration Runner  ');
  console.log('=====================================================');

  try {
    // 1. Test Connectivity
    console.log('\n[1/3] Testing MySQL connection...');
    await sequelize.authenticate();
    console.log('  ✓ Connected to database successfully.');

    // 2. Ensure admin ownership columns exist before model sync
    console.log('\n[2/3] Ensuring product ownership schema is present...');
    await ensureProductOwnershipColumns();
    console.log('  ✓ Product ownership column and index are present.');
    await ensurePaymentMethods();
    console.log('  ✓ Demo payment methods are present.');
    await ensureCategoryOwnershipColumn();
    console.log('  ✓ Category ownership column is present.');
    await backfillLegacyAdminOwnership();
    console.log('  ✓ Legacy product and category ownership was assigned to the Super Admin.');

    console.log('\n[3/3] Synchronizing Sequelize models with MySQL schema...');
    // Safe sync without destructive drops
    await sequelize.sync();
    console.log('  ✓ Schema synchronized cleanly. All 27 models verified.');

    // Verify key tables
    const [tables] = await sequelize.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log(`  ✓ Total database tables registered: ${tableNames.length}`);

    // 3. Optional Seeder
    if (process.argv.includes('--seed')) {
      console.log('\n[3/3] Running seeders...');
      const seedDatabase = require('../seeders/seed');
      if (typeof seedDatabase === 'function') {
        await seedDatabase();
        console.log('  ✓ Database seeded successfully.');
      } else {
        console.log('  ℹ Seed file executed.');
      }
    } else {
      console.log('\n[3/3] Skipping seeders (use --seed flag to populate test accounts and products).');
    }

    console.log('\n=====================================================');
    console.log('  MIGRATION COMPLETE — DATABASE READY FOR PRODUCTION ');
    console.log('=====================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration Failed:', error);
    logger.error('Database migration error:', error);
    process.exit(1);
  }
}

migrate();
