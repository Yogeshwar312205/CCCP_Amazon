const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');
const DevController = require('../controllers/dev.controller');

// All developer routes require auth + DEVELOPER role
// ZERO business data, ZERO PII — infra telemetry only
router.use(authenticate);
router.use(authorize('DEVELOPER'));

// DB pool stats + Node.js heap/CPU vitals
router.get('/health', DevController.getSystemHealth);

// Last N executed Sequelize migrations
router.get('/migrations', DevController.getMigrations);

// Tail of Winston log files (error or combined)
router.get('/logs', DevController.getLogs);

// Table row count stats (migration verification, no data exposed)
router.get('/tables', DevController.getTableStats);

module.exports = router;
