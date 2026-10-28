/**
 * Standardized API response helpers.
 * Keeps controllers thin - no inline JSON shapes needed.
 *
 * Usage:
 *   sendSuccess(res, { user }, 'User created', 201);
 *   sendError(res, 'Not found', 404, 'NOT_FOUND');
 *   sendPaginated(res, products, pagination, 'Products retrieved');
 */

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {*} data - Payload to include under `data`
 * @param {string} [message='Success']
 * @param {number} [statusCode=200]
 * @param {object} [meta] - Optional pagination/extras
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send a paginated list response.
 * @param {import('express').Response} res
 * @param {Array}  items
 * @param {object} pagination - { page, limit, total, totalPages }
 * @param {string} [message='Retrieved successfully']
 */
const sendPaginated = (res, items, pagination, message = 'Retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    meta: { pagination },
  });
};

/**
 * Send an error JSON response (used in middlewares/routes, NOT in services).
 * Prefer throwing AppError inside services; let the error middleware call this.
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, code = 'INTERNAL_ERROR') => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: { code },
  });
};

module.exports = { sendSuccess, sendPaginated, sendError };
