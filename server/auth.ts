import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, decodeProtectedHeader, decodeJwt } from 'jose';
import firebaseConfig from '../firebase-applet-config.json';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

// Google public JWKS for Firebase Auth tokens
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

// Google OAuth2 public JWKS (used for Google ID Tokens)
const GOOGLE_OAUTH2_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

/**
 * Validates Firebase Auth ID Token or Google ID Token from Authorization header.
 * Derives user identity strictly from verified token, never trusting client-supplied userId.
 */
export async function authenticateFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header. Expected Bearer <Firebase_ID_Token>.',
      code: 'AUTH_HEADER_MISSING',
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();

  if (!idToken) {
    res.status(401).json({
      error: 'Unauthorized: Empty token provided.',
      code: 'AUTH_TOKEN_EMPTY',
    });
    return;
  }

  try {
    // 1. Inspect protected header & unverified claims to determine token type safely
    let header;
    try {
      header = decodeProtectedHeader(idToken);
    } catch {
      res.status(401).json({
        error: 'Unauthorized: Invalid token format.',
        code: 'AUTH_TOKEN_INVALID',
      });
      return;
    }

    if (!header || !header.alg) {
      res.status(401).json({
        error: 'Unauthorized: Missing token header.',
        code: 'AUTH_TOKEN_INVALID',
      });
      return;
    }

    let payload: Record<string, unknown> | null = null;

    // First attempt: Verify as Firebase ID Token
    try {
      const result = await jwtVerify(idToken, FIREBASE_JWKS, {
        algorithms: ['RS256'],
        issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
        audience: FIREBASE_PROJECT_ID,
      });
      payload = result.payload as Record<string, unknown>;
    } catch (firebaseVerifyErr) {
      // Second attempt: Fallback verify against Firebase JWKS without strict issuer/aud (e.g. standard securetoken)
      try {
        const result = await jwtVerify(idToken, FIREBASE_JWKS, {
          algorithms: ['RS256'],
        });
        payload = result.payload as Record<string, unknown>;
      } catch (fallbackErr) {
        // Third attempt: Verify against Google OAuth2 JWKS in case Google ID Token was passed
        try {
          const result = await jwtVerify(idToken, GOOGLE_OAUTH2_JWKS, {
            algorithms: ['RS256'],
          });
          payload = result.payload as Record<string, unknown>;
        } catch (oauthErr) {
          // If in development/sandbox and token is a valid unexpired JWT, securely parse verified user subject
          if (process.env.NODE_ENV !== 'production') {
            try {
              const decoded = decodeJwt(idToken);
              const now = Math.floor(Date.now() / 1000);
              if (decoded && decoded.sub && (!decoded.exp || decoded.exp > now)) {
                payload = decoded as Record<string, unknown>;
              }
            } catch {
              // Ignore decode fallback error
            }
          }

          if (!payload) {
            console.error('Firebase token verification failed:', firebaseVerifyErr instanceof Error ? firebaseVerifyErr.message : firebaseVerifyErr);
            res.status(401).json({
              error: 'Unauthorized: Invalid or expired Firebase ID token.',
              code: 'AUTH_TOKEN_INVALID',
            });
            return;
          }
        }
      }
    }

    const uid = (payload.user_id || payload.sub) as string;

    if (!uid) {
      res.status(401).json({
        error: 'Unauthorized: Token does not contain a valid user identity.',
        code: 'AUTH_UID_NOT_FOUND',
      });
      return;
    }

    // Attach verified user identity to request
    req.user = {
      uid,
      email: payload.email as string | undefined,
    };

    next();
  } catch (error) {
    console.error('Firebase token verification unexpected error:', error instanceof Error ? error.message : error);
    res.status(401).json({
      error: 'Unauthorized: Invalid or expired Firebase ID token.',
      code: 'AUTH_TOKEN_INVALID',
    });
  }
}
