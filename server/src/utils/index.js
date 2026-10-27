/**
 * Central export for all server utilities.
 * Usage: const { AppError, sendSuccess } = require('../utils');
 */
const AppError = require('./AppError');
const { sendSuccess, sendPaginated, sendError } = require('./response');
const paginate = require('./paginate');

module.exports = { AppError, sendSuccess, sendPaginated, sendError, paginate };
