/**
 * DevController — Developer / DevSecOps Portal
 *
 * IMPORTANT: This controller exposes ZERO business financials, customer PII,
 * or order data. It is strictly infrastructure telemetry.
 *
 * Only accessible to users with role === 'DEVELOPER'.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

class DevController {
  /**
   * GET /dev/health
   * Database pool stats + Node.js process vitals.
   */
  static async getSystemHealth(req, res, next) {
    try {
      // DB Connection Pool stats (Sequelize exposes these via connectionManager)
      const pool = sequelize.connectionManager.pool;
      const dbStats = {
        total: pool ? pool.size : 'N/A',
        available: pool ? pool.available : 'N/A',
        using: pool ? pool.using : 'N/A',
        waiting: pool ? pool.waiting : 'N/A',
      };

      // Node.js process memory vitals
      const memory = process.memoryUsage();
      const systemVitals = {
        uptime: Math.round(process.uptime()),
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        rssMB: Math.round(memory.rss / 1024 / 1024),
        externalMB: Math.round((memory.external || 0) / 1024 / 1024),
        cpuLoad1m: os.loadavg()[0].toFixed(2),
        cpuLoad5m: os.loadavg()[1].toFixed(2),
        cpuLoad15m: os.loadavg()[2].toFixed(2),
        totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
        freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
        nodeVersion: process.version,
        platform: process.platform,
      };

      // DB connectivity test
      let dbPing = 'UNKNOWN';
      try {
        const start = Date.now();
        await sequelize.authenticate();
        dbPing = `${Date.now() - start}ms`;
      } catch {
        dbPing = 'FAILED';
      }

      res.json({
        success: true,
        data: {
          dbStats: { ...dbStats, pingLatency: dbPing },
          systemVitals,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /dev/migrations
   * Last 10 executed Sequelize migrations (SequelizeMeta table).
   */
  static async getMigrations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      let migrations = [];
      try {
        const [rows] = await sequelize.query(
          `SELECT name FROM SequelizeMeta ORDER BY name DESC LIMIT ${Math.min(limit, 50)};`
        );
        migrations = rows;
      } catch {
        // SequelizeMeta might not exist if not using Sequelize CLI migrations
        migrations = [{ name: 'SequelizeMeta table not found — project uses sequelize.sync()' }];
      }

      res.json({ success: true, data: { migrations } });
    } catch (err) { next(err); }
  }

  /**
   * GET /dev/logs
   * Tail of server/logs/error.log and combined.log.
   * Query params: level (error|combined), lines (default 50, max 200)
   */
  static async getLogs(req, res, next) {
    try {
      const level = req.query.level || 'combined';
      const lines = Math.min(parseInt(req.query.lines, 10) || 50, 200);

      const validFiles = {
        error: 'error.log',
        combined: 'combined.log',
      };

      const filename = validFiles[level];
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Invalid log level. Use "error" or "combined".',
        });
      }

      // Resolve log path relative to server root
      const logPath = path.resolve(__dirname, '../../../logs', filename);
      let logEntries = [];

      if (fs.existsSync(logPath)) {
        const raw = fs.readFileSync(logPath, 'utf-8');
        logEntries = raw
          .trim()
          .split('\n')
          .filter(Boolean)
          .slice(-lines)
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch {
              return { raw: line };
            }
          });
      } else {
        logEntries = [{ message: `Log file not found at ${logPath}`, level: 'info' }];
      }

      res.json({
        success: true,
        data: {
          level,
          linesRequested: lines,
          linesReturned: logEntries.length,
          entries: logEntries,
        },
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /dev/tables
   * Lists all tables in the database and their row counts.
   * Useful for verifying migration results without exposing data.
   */
  static async getTableStats(req, res, next) {
    try {
      const [tables] = await sequelize.query('SHOW TABLES');
      const tableNames = tables.map((t) => Object.values(t)[0]);

      const stats = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            const [[{ count }]] = await sequelize.query(
              `SELECT COUNT(*) as count FROM \`${tableName}\``
            );
            return { table: tableName, rowCount: parseInt(count, 10) };
          } catch {
            return { table: tableName, rowCount: 'ERROR' };
          }
        })
      );

      res.json({ success: true, data: { tables: stats, totalTables: stats.length } });
    } catch (err) { next(err); }
  }
}

module.exports = DevController;
