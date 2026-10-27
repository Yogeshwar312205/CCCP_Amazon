const AppError = require('../../../src/utils/AppError');

describe('AppError', () => {
  test('creates error with message, statusCode, and code', () => {
    const err = new AppError('Not found', 404, 'NOT_FOUND');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.name).toBe('AppError');
  });

  test('defaults statusCode to 500 and code to INTERNAL_ERROR', () => {
    const err = new AppError('Something went wrong');

    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  test('captures a stack trace', () => {
    const err = new AppError('Test error');
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('AppError');
  });

  test('works with 4xx status codes', () => {
    const err400 = new AppError('Bad request', 400, 'BAD_REQUEST');
    const err401 = new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const err403 = new AppError('Forbidden', 403, 'FORBIDDEN');

    expect(err400.statusCode).toBe(400);
    expect(err401.statusCode).toBe(401);
    expect(err403.statusCode).toBe(403);
  });
});
