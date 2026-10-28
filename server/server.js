const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const env = require('./config/env');
const logger = require('./config/logger');
const { sequelize } = require('./src/models');
const ensureProductOwnershipColumns = require('./src/utils/ensureProductOwnershipColumns');
const ensurePaymentMethods = require('./src/utils/ensurePaymentMethods');
const ensureCategoryOwnershipColumn = require('./src/utils/ensureCategoryOwnershipColumn');
const backfillLegacyAdminOwnership = require('./src/utils/backfillLegacyAdminOwnership');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/error.middleware');
const { globalLimiter } = require('./src/middlewares/rateLimiter.middleware');

const app = express();

// Trust the AWS Application Load Balancer as the reverse proxy.
// Required for express-rate-limit to correctly handle X-Forwarded-For.
app.set('trust proxy', 1);

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads with production caching headers
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    immutable: true,
  })
);

// Mount API v1 routes
app.use('/api/v1', routes);

// Global centralized error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    await ensureProductOwnershipColumns();
    logger.info('Ensured product ownership column exists for admin-scoped product access.');
    await ensurePaymentMethods();
    logger.info('Ensured demo payment methods are supported.');
    await ensureCategoryOwnershipColumn();
    logger.info('Ensured category ownership column exists.');
    await backfillLegacyAdminOwnership();
    logger.info('Backfilled legacy product and category ownership to the Super Admin.');

    // Synchronize Sequelize models
    await sequelize.sync();
    logger.info('Sequelize models synchronized with MySQL database.');

    // Listen on all network interfaces for Docker/ECS
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(
        `🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;