import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { NextFunction, Response } from 'express';
import { authenticateFirebaseToken, isValidFirebaseIdentityClaims, type AuthenticatedRequest } from './auth';

function makeResponse() {
  const result: { statusCode?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(body: unknown) {
      result.body = body;
      return this;
    },
  } as unknown as Response;
  return { res, result };
}

test('rejects requests without an Authorization header', async () => {
  const req = { headers: {} } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;

  await authenticateFirebaseToken(req, res, (() => { nextCalled = true; }) as NextFunction);

  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { code: string }).code, 'AUTH_HEADER_MISSING');
  assert.equal(nextCalled, false);
});

test('rejects malformed bearer tokens without authenticating the request', async () => {
  const req = {
    headers: { authorization: 'Bearer not-a-valid-jwt' },
  } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;

  await authenticateFirebaseToken(req, res, (() => { nextCalled = true; }) as NextFunction);

  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { code: string }).code, 'AUTH_TOKEN_INVALID');
  assert.equal(nextCalled, false);
  assert.equal(req.user, undefined);
});

test('rejects oversized bearer tokens before verification', async () => {
  const req = {
    headers: { authorization: `Bearer ${'a'.repeat(16_385)}` },
  } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;

  await authenticateFirebaseToken(req, res, (() => { nextCalled = true; }) as NextFunction);

  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { code: string }).code, 'AUTH_TOKEN_INVALID');
  assert.equal(nextCalled, false);
});


test('accepts a valid Firebase identity claim set', () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'firebase-user-123', auth_time: now, user_id: 'firebase-user-123' }), true);
});

test('rejects missing, empty, and oversized Firebase subject claims', () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(isValidFirebaseIdentityClaims({ auth_time: now }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: '', auth_time: now }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'u'.repeat(129), auth_time: now }), false);
});

test('rejects invalid or implausibly future Firebase auth_time claims', () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: 'not-a-number' }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: Number.NaN }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: now + 61 }), false);
});

test('rejects a Firebase user_id claim that differs from the verified subject', () => {
  const now = Math.floor(Date.now() / 1000);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: now, user_id: 'different-user' }), false);
});
