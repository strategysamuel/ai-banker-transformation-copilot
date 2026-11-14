import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import firebaseConfig from '../firebase-applet-config.json';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

type FirebaseTokenVerifier = (token: string) => Promise<JWTPayload>;

// Firebase Auth signs ID tokens with Google's Secure Token service account keys.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;

async function verifyFirebaseIdToken(idToken: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    algorithms: ['RS256'],
    issuer: FIREBASE_ISSUER,
    audience: FIREBASE_PROJECT_ID,
    requiredClaims: ['exp', 'iat', 'sub', 'auth_time'],
  });
  return payload;
}

/** Validate Firebase-specific identity claims after cryptographic JWT verification. */
export function isValidFirebaseIdentityClaims(payload: {
  sub?: unknown;
  auth_time?: unknown;
  user_id?: unknown;
}): boolean {
  const uid = payload.sub;
  const authTime = payload.auth_time;
  return (
    typeof uid === 'string' &&
    uid.length > 0 &&
    uid.length <= 128 &&
    typeof authTime === 'number' &&
    Number.isFinite(authTime) &&
    authTime >= 0 &&
    authTime <= Math.floor(Date.now() / 1000) + 60 &&
    (payload.user_id === undefined || payload.user_id === uid)
  );
}

/**
 * Creates Firebase authentication middleware. The optional verifier is exposed
 * for deterministic local tests; production routes use the Google JWKS verifier.
 */
export function createFirebaseAuthMiddleware(
  verifyToken: FirebaseTokenVerifier = verifyFirebaseIdToken
) {
  return async function authenticateFirebaseToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const authHeader = req.headers.authorization;
    const match = typeof authHeader === 'string'
      ? /^Bearer\s+(\S+)$/i.exec(authHeader)
      : null;

    if (!match) {
      res.status(401).json({
        error: 'Unauthorized: Expected Authorization: Bearer <Firebase_ID_Token>.',
        code: 'AUTH_HEADER_MISSING',
      });
      return;
    }

    const idToken = match[1];
    if (idToken.length > 16_384) {
      res.status(401).json({
        error: 'Unauthorized: Invalid or expired Firebase ID token.',
        code: 'AUTH_TOKEN_INVALID',
      });
      return;
    }

    try {
      const payload = await verifyToken(idToken);
      if (!isValidFirebaseIdentityClaims(payload)) {
        res.status(401).json({
          error: 'Unauthorized: Invalid or expired Firebase ID token.',
          code: 'AUTH_TOKEN_INVALID',
        });
        return;
      }

      req.user = {
        uid: payload.sub as string,
        ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
      };
      next();
    } catch {
      // Do not log token contents, decoded claims, or provider verification details.
      res.status(401).json({
        error: 'Unauthorized: Invalid or expired Firebase ID token.',
        code: 'AUTH_TOKEN_INVALID',
      });
    }
  };
}

// Production middleware always uses the strict Google JWKS verifier above.
export const authenticateFirebaseToken = createFirebaseAuthMiddleware();
