const authorize = require('../../../src/middlewares/rbac.middleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('authorize (RBAC) middleware', () => {
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('calls next() when user role is in allowedRoles', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = mockRes();

    authorize('ADMIN', 'SUPER_ADMIN')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 403 when user role is not in allowedRoles', () => {
    const req = { user: { role: 'CUSTOMER' } };
    const res = mockRes();

    authorize('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('FORBIDDEN');
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when req.user is missing', () => {
    const req = {};
    const res = mockRes();

    authorize('CUSTOMER')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  test('allows SUPER_ADMIN when only SUPER_ADMIN is listed', () => {
    const req = { user: { role: 'SUPER_ADMIN' } };
    const res = mockRes();

    authorize('SUPER_ADMIN')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('allows multiple roles: ADMIN and SUPER_ADMIN both pass', () => {
    const middleware = authorize('ADMIN', 'SUPER_ADMIN');

    ['ADMIN', 'SUPER_ADMIN'].forEach((role) => {
      jest.clearAllMocks();
      const req = { user: { role } };
      const res = mockRes();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
