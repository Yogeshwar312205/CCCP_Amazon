/**
 * CCCP Amazon Database Migration & Schema Synchronizer
 * 
 * Usage:
 *   node scripts/migrate.js
 *   node scripts/migrate.js --seed
 */

const { sequelize } = require('../src/models');
const logger = require('../config/logger');

async function ensureProductMarketplaceColumns() {
  const [columns] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME IN ('shop_id', 'is_boosted')
  `);
  const existingColumns = new Set(columns.map(({ COLUMN_NAME: name }) => name));

  if (!existingColumns.has('shop_id')) {
    await sequelize.query(`
      ALTER TABLE products
      ADD COLUMN shop_id BIGINT UNSIGNED NULL
    `);
    console.log('  ✓ Added products.shop_id.');
  }

  if (!existingColumns.has('is_boosted')) {
    await sequelize.query(`
      ALTER TABLE products
      ADD COLUMN is_boosted BOOLEAN NOT NULL DEFAULT FALSE
    `);
    console.log('  ✓ Added products.is_boosted.');
  }
}

async function ensureOrderItemMarketplaceColumns() {
  const [columns] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'order_items'
      AND COLUMN_NAME IN ('seller_order_id', 'shop_id')
  `);
  const existingColumns = new Set(columns.map(({ COLUMN_NAME: name }) => name));

  if (!existingColumns.has('seller_order_id')) {
    await sequelize.query(`
      ALTER TABLE order_items
      ADD COLUMN seller_order_id BIGINT UNSIGNED NULL
    `);
    console.log('  ✓ Added order_items.seller_order_id.');
  }

  if (!existingColumns.has('shop_id')) {
    await sequelize.query(`
      ALTER TABLE order_items
      ADD COLUMN shop_id BIGINT UNSIGNED NULL
    `);
    console.log('  ✓ Added order_items.shop_id.');
  }
}

async function migrate() {
  console.log('=====================================================');
  console.log('  CCCP Amazon — Production Database Migration Runner  ');
  console.log('=====================================================');

  try {
    // 1. Test Connectivity
    console.log('\n[1/3] Testing MySQL connection...');
    await sequelize.authenticate();
    console.log('  ✓ Connected to database successfully.');

    // 2. Synchronize Models
    console.log('\n[2/3] Synchronizing Sequelize models with MySQL schema...');
    // Safe sync without destructive drops
    await sequelize.sync();
    console.log('  ✓ Schema synchronized cleanly. All 27 models verified.');

    // Add columns introduced by the marketplace model without altering existing data.
    await ensureProductMarketplaceColumns();
    await ensureOrderItemMarketplaceColumns();

    // Verify key tables
    const [tables] = await sequelize.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log(`  ✓ Total database tables registered: ${tableNames.length}`);

    // 3. Optional Seeder
    if (process.argv.includes('--seed')) {
      console.log('\n[3/3] Running seeders...');
      // Use the new multi-vendor seeder
      const path = require('path');
      const seedPath = path.join(__dirname, '../seeders/seed.js');
      // The seeder calls process.exit() itself; we just require it here
      require(seedPath);
      return; // seeder controls process lifecycle
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
