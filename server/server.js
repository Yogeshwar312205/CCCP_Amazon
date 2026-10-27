const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const env = require('./config/env');
const logger = require('./config/logger');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/error.middleware');
const { globalLimiter } = require('./src/middlewares/rateLimiter.middleware');
const { startScheduler } = require('./src/scheduler/escrow.scheduler');

const app = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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
    // Sync database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Synchronize models without destructive lock-prone ALTER queries on boot
    await sequelize.sync();
    logger.info('Sequelize models synchronized with MySQL database.');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      // Start background escrow settlement + boost expiry scheduler
      startScheduler();
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
