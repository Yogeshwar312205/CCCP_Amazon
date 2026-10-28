const paginate = require('../../../src/utils/paginate');

describe('paginate()', () => {
  test('returns defaults when no query is provided', () => {
    const { page, limit, offset } = paginate({});

    expect(page).toBe(1);
    expect(limit).toBe(12);
    expect(offset).toBe(0);
  });

  test('parses page and limit from string query params', () => {
    const { page, limit, offset } = paginate({ page: '3', limit: '20' });

    expect(page).toBe(3);
    expect(limit).toBe(20);
    expect(offset).toBe(40); // (3 - 1) * 20
  });

  test('clamps limit to MAX_LIMIT of 100', () => {
    const { limit } = paginate({ limit: '500' });
    expect(limit).toBe(100);
  });

  test('clamps page to minimum of 1 for invalid values', () => {
    const { page } = paginate({ page: '-5' });
    expect(page).toBe(1);
  });

  test('clamps page to 1 for non-numeric page', () => {
    const { page } = paginate({ page: 'abc' });
    expect(page).toBe(1);
  });

  test('buildMeta returns correct pagination metadata', () => {
    const { buildMeta } = paginate({ page: '2', limit: '10' });
    const meta = buildMeta(95);

    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.total).toBe(95);
    expect(meta.totalPages).toBe(10); // ceil(95/10)
    expect(meta.hasNext).toBe(true);
    expect(meta.hasPrev).toBe(true);
  });

  test('buildMeta correctly sets hasNext false on last page', () => {
    const { buildMeta } = paginate({ page: '5', limit: '10' });
    const meta = buildMeta(50);

    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
  });

  test('buildMeta correctly sets hasPrev false on first page', () => {
    const { buildMeta } = paginate({ page: '1', limit: '10' });
    const meta = buildMeta(50);

    expect(meta.hasPrev).toBe(false);
    expect(meta.hasNext).toBe(true);
  });

  test('handles total of 0 correctly', () => {
    const { buildMeta } = paginate({});
    const meta = buildMeta(0);

    expect(meta.total).toBe(0);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(false);
  });
});
