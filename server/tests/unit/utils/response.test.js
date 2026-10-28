const { sendSuccess, sendPaginated, sendError } = require('../../../src/utils/response');

// Mock Express res object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('sendSuccess()', () => {
  test('sends 200 with data and message', () => {
    const res = mockRes();
    sendSuccess(res, { id: 1 }, 'Created', 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: 1 },
    });
  });

  test('omits data key when data is null', () => {
    const res = mockRes();
    sendSuccess(res, null, 'Done');

    const payload = res.json.mock.calls[0][0];
    expect(payload).not.toHaveProperty('data');
  });

  test('includes meta when provided', () => {
    const res = mockRes();
    const meta = { pagination: { page: 1, total: 100 } };
    sendSuccess(res, [], 'OK', 200, meta);

    const payload = res.json.mock.calls[0][0];
    expect(payload.meta).toEqual(meta);
  });

  test('defaults to status 200 and message Success', () => {
    const res = mockRes();
    sendSuccess(res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Success');
  });
});

describe('sendPaginated()', () => {
  test('sends 200 with items array and pagination meta', () => {
    const res = mockRes();
    const items = [{ id: 1 }, { id: 2 }];
    const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };

    sendPaginated(res, items, pagination, 'Products retrieved');

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data).toEqual(items);
    expect(payload.meta.pagination).toEqual(pagination);
    expect(payload.message).toBe('Products retrieved');
  });
});

describe('sendError()', () => {
  test('sends error response with correct shape', () => {
    const res = mockRes();
    sendError(res, 'Not found', 404, 'NOT_FOUND');

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not found',
      error: { code: 'NOT_FOUND' },
    });
  });

  test('defaults to 500 Internal Server Error', () => {
    const res = mockRes();
    sendError(res);

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('INTERNAL_ERROR');
  });
});
