import assert from 'node:assert/strict';
import { generateKeyPair } from 'node:crypto';
import { test } from 'node:test';
import type { NextFunction, Response } from 'express';
import { jwtVerify, SignJWT } from 'jose';
import {
  authenticateFirebaseToken,
  createFirebaseAuthMiddleware,
  isValidFirebaseIdentityClaims,
  type AuthenticatedRequest,
} from './auth';

const TEST_PROJECT_ID = 'unit-test-firebase-project';
const TEST_ISSUER = `https://securetoken.google.com/${TEST_PROJECT_ID}`;
const now = () => Math.floor(Date.now() / 1000);

const keyPairPromise = generateKeyPair('rsa', { modulusLength: 2048 });
const otherKeyPairPromise = generateKeyPair('rsa', { modulusLength: 2048 });

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

async function makeSignedToken(overrides: {
  issuer?: string;
  audience?: string;
  subject?: string;
  authTime?: number;
  userId?: string;
  expiration?: string;
} = {}) {
  const { privateKey } = await keyPairPromise;
  const issuedAt = now();
  const subject = overrides.subject ?? 'firebase-user-123';
  return new SignJWT({
    auth_time: overrides.authTime ?? issuedAt,
    user_id: overrides.userId ?? subject,
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(overrides.issuer ?? TEST_ISSUER)
    .setAudience(overrides.audience ?? TEST_PROJECT_ID)
    .setSubject(subject)
    .setIssuedAt(issuedAt)
    .setExpirationTime(overrides.expiration ?? '2h')
    .sign(privateKey);
}

function makeTestMiddleware() {
  return createFirebaseAuthMiddleware(async (token) => {
    const { publicKey } = await keyPairPromise;
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: TEST_ISSUER,
      audience: TEST_PROJECT_ID,
      requiredClaims: ['exp', 'iat', 'sub', 'auth_time'],
    });
    return payload;
  });
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
  const req = { headers: { authorization: 'Bearer not-a-valid-jwt' } } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;
  await authenticateFirebaseToken(req, res, (() => { nextCalled = true; }) as NextFunction);
  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { code: string }).code, 'AUTH_TOKEN_INVALID');
  assert.equal(nextCalled, false);
  assert.equal(req.user, undefined);
});

test('rejects oversized bearer tokens before verification', async () => {
  const req = { headers: { authorization: `Bearer ${'a'.repeat(16_385)}` } } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;
  await authenticateFirebaseToken(req, res, (() => { nextCalled = true; }) as NextFunction);
  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { code: string }).code, 'AUTH_TOKEN_INVALID');
  assert.equal(nextCalled, false);
});

test('accepts a locally signed Firebase-shaped RS256 token and sets the verified UID', async () => {
  const token = await makeSignedToken();
  const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;
  await makeTestMiddleware()(req, res, (() => { nextCalled = true; }) as NextFunction);
  assert.equal(result.statusCode, undefined);
  assert.equal(nextCalled, true);
  assert.equal(req.user?.uid, 'firebase-user-123');
});

test('rejects a token signed by a different RSA key', async () => {
  const token = await makeSignedToken();
  const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  const middleware = createFirebaseAuthMiddleware(async (value) => {
    const { publicKey } = await otherKeyPairPromise;
    const { payload } = await jwtVerify(value, publicKey, {
      algorithms: ['RS256'], issuer: TEST_ISSUER, audience: TEST_PROJECT_ID,
    });
    return payload;
  });
  let nextCalled = false;
  await middleware(req, res, (() => { nextCalled = true; }) as NextFunction);
  assert.equal(result.statusCode, 401);
  assert.equal((result.body as { code: string }).code, 'AUTH_TOKEN_INVALID');
  assert.equal(nextCalled, false);
});

test('rejects tokens with the wrong issuer or audience', async () => {
  for (const token of [
    await makeSignedToken({ issuer: 'https://accounts.google.com' }),
    await makeSignedToken({ audience: 'another-firebase-project' }),
  ]) {
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const { res, result } = makeResponse();
    let nextCalled = false;
    await makeTestMiddleware()(req, res, (() => { nextCalled = true; }) as NextFunction);
    assert.equal(result.statusCode, 401);
    assert.equal(nextCalled, false);
  }
});

test('rejects expired signed tokens', async () => {
  const token = await makeSignedToken({ expiration: '0s' });
  const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
  const { res, result } = makeResponse();
  let nextCalled = false;
  await makeTestMiddleware()(req, res, (() => { nextCalled = true; }) as NextFunction);
  assert.equal(result.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('rejects missing, empty, and oversized Firebase subject claims', () => {
  const timestamp = now();
  assert.equal(isValidFirebaseIdentityClaims({ auth_time: timestamp }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: '', auth_time: timestamp }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'u'.repeat(129), auth_time: timestamp }), false);
});

test('rejects invalid, negative, or implausibly future Firebase auth_time claims', () => {
  const timestamp = now();
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: 'not-a-number' }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: Number.NaN }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: -1 }), false);
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: timestamp + 61 }), false);
});

test('rejects a Firebase user_id claim that differs from the verified subject', () => {
  assert.equal(isValidFirebaseIdentityClaims({ sub: 'user-1', auth_time: now(), user_id: 'different-user' }), false);
});
