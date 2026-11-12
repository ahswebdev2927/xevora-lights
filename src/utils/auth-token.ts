import { jwtVerify, SignJWT, createRemoteJWKSet } from "jose";

// Google's official public JWKS endpoint for verifying Firebase Auth ID Tokens
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

function getSessionSecretKey(): Uint8Array {
  const secret = process.env.FIREBASE_PRIVATE_KEY || process.env.SESSION_SECRET || "dry-fish-basket-secure-session-key-2026";
  return new TextEncoder().encode(secret);
}

export interface VerifiedFirebaseToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  phone?: string;
}

/**
 * Verifies a client-side Firebase Auth ID token directly against Google's JWKS public keys.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken | null> {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "xevora-lights-web";
    const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid = payload.sub as string;
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
    const name = typeof payload.name === "string" ? payload.name : undefined;
    const picture = typeof payload.picture === "string" ? payload.picture : undefined;

    let phone: string | undefined = undefined;
    const rawPhone = payload.phone_number as string | undefined;
    if (rawPhone) {
      phone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
    }

    return { uid, email, name, picture, phone };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Auth Token] Firebase ID token verification failed:", errorMsg);
    return null;
  }
}

export interface SessionPayload {
  email?: string;
  phone?: string;
  role: "admin" | "user";
  userId?: number;
}

/**
 * Generates a signed 30-day session token for an authenticated user or admin.
 */
export async function createSessionToken(
  identifierOrPayload: string | SessionPayload,
  optionalRole?: "admin" | "user"
): Promise<string> {
  const secret = getSessionSecretKey();

  let payloadToSign: Record<string, unknown>;

  if (typeof identifierOrPayload === "string") {
    const role = optionalRole || "user";
    if (identifierOrPayload.includes("@")) {
      payloadToSign = { email: identifierOrPayload.toLowerCase(), role };
    } else {
      payloadToSign = { phone: identifierOrPayload, role };
    }
  } else {
    payloadToSign = {
      ...identifierOrPayload,
      role: identifierOrPayload.role || optionalRole || "user",
      ...(identifierOrPayload.email ? { email: identifierOrPayload.email.toLowerCase() } : {}),
    };
  }

  return await new SignJWT(payloadToSign)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export interface VerifiedSession {
  email?: string;
  phone?: string;
  role: string;
  userId?: number;
}

/**
 * Verifies an auth_session or admin_session token, returning the user payload if valid.
 */
export async function verifySessionToken(token: string): Promise<VerifiedSession | null> {
  if (!token) return null;

  // Support local developer mock session ONLY in development
  if (process.env.NODE_ENV === "development") {
    if (/^\d{10}$/.test(token)) {
      return { phone: token, role: "user" };
    }
    if (token.includes("@")) {
      return { email: token.toLowerCase(), role: "user" };
    }
  }

  try {
    // 1. Verify standard session token issued by our backend
    const secret = getSessionSecretKey();
    const { payload } = await jwtVerify(token, secret);
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
    const phone = typeof payload.phone === "string" ? payload.phone : undefined;
    const role = (payload.role as string) || "user";
    const userId = typeof payload.userId === "number" ? payload.userId : undefined;

    if (email || phone) {
      return { email, phone, role, userId };
    }
  } catch {
    // 2. Fallback: verify as a raw Firebase ID token directly via JWKS
    try {
      const verifiedFirebase = await verifyFirebaseIdToken(token);
      if (verifiedFirebase) {
        return {
          email: verifiedFirebase.email,
          phone: verifiedFirebase.phone,
          role: "user",
        };
      }
    } catch {}
  }

  return null;
}
