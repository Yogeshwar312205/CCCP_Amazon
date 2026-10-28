/**
 * Shared pagination utility.
 *
 * Usage in a service:
 *   const { limit, offset, buildMeta } = paginate(req.query);
 *   const { count, rows } = await Model.findAndCountAll({ limit, offset });
 *   return { items: rows, meta: buildMeta(count) };
 */

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT     = 100;

/**
 * Parse and validate page/limit from a query object.
 * @param {{ page?: string|number, limit?: string|number }} query
 * @returns {{ page: number, limit: number, offset: number, buildMeta: (total: number) => object }}
 */
const paginate = (query = {}) => {
  const page  = Math.max(1, parseInt(query.page,  10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  const buildMeta = (total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  });

  return { page, limit, offset, buildMeta };
};

module.exports = paginate;
