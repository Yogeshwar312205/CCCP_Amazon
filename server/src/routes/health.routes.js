const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

/**
 * Format uptime into days, hours, minutes, seconds
 */
const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

/**
 * GET /api/v1/health
 * Public health check endpoint for container orchestrators, load balancers, and monitoring.
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  let dbLatencyMs = null;
  let isHealthy = false;
  let dbStatus;

  try {
    const dbStart = Date.now();
    await sequelize.authenticate();
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'CONNECTED';
    isHealthy = true;
  } catch (err) {
    dbStatus = 'ERROR';
    process.stderr.write(`Healthcheck DB error: ${err.message}\n`);
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = process.uptime();

  const payload = {
    success: isHealthy,
    status: isHealthy ? 'HEALTHY' : 'DEGRADED',
    message: isHealthy ? 'CCCP Amazon API is operational' : 'Database connectivity degraded',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    system: {
      uptime: {
        seconds: Math.floor(uptimeSeconds),
        formatted: formatUptime(uptimeSeconds),
      },
      memory: {
        rssMB: (memory.rss / (1024 * 1024)).toFixed(2),
        heapTotalMB: (memory.heapTotal / (1024 * 1024)).toFixed(2),
        heapUsedMB: (memory.heapUsed / (1024 * 1024)).toFixed(2),
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      dialect: sequelize.getDialect(),
    },
    latencyMs: Date.now() - startTime,
  };

  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(payload);
});

module.exports = router;
