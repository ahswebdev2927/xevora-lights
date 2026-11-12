import { cookies } from "next/headers";
import { isAuthorizedAdmin } from "@/utils/admin-helper";
import { verifySessionToken } from "@/utils/auth-token";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AuthenticatedUser = typeof users.$inferSelect;

/**
 * Retrieves the full user record from the database for the given session cookie.
 */
export async function getAuthenticatedUser(
  cookieName: "auth_session" | "admin_session" = "auth_session"
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return null;

    const verified = await verifySessionToken(token);
    if (!verified) return null;

    if (verified.userId) {
      const userRows = await db.select().from(users).where(eq(users.id, verified.userId)).limit(1);
      if (userRows.length > 0) return userRows[0];
    }

    if (verified.email) {
      const userRows = await db.select().from(users).where(eq(users.email, verified.email)).limit(1);
      if (userRows.length > 0) return userRows[0];
    }

    if (verified.phone) {
      const userRows = await db.select().from(users).where(eq(users.phoneNumber, verified.phone)).limit(1);
      if (userRows.length > 0) return userRows[0];
    }

    return null;
  } catch (error) {
    console.error(`[Auth Helper] Failed to resolve user from '${cookieName}':`, error);
    return null;
  }
}

/**
 * Verifies the session cookie and returns the phone number (or email/identifier if phone is absent).
 */
export async function getVerifiedPhoneFromCookie(
  cookieName: "auth_session" | "admin_session"
): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return null;

    const verified = await verifySessionToken(token);
    if (!verified) return null;

    if (verified.phone) return verified.phone;

    // Fallback: look up user by email to retrieve phone if exists
    if (verified.email) {
      const user = await getAuthenticatedUser(cookieName);
      if (user?.phoneNumber) return user.phoneNumber;
      return verified.email;
    }

    return null;
  } catch (error) {
    console.error(`[Auth Helper] Failed to verify token in cookie '${cookieName}':`, error);
    return null;
  }
}

/**
 * Checks if the current admin session is valid and authorized via email or phone.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;

    const verified = await verifySessionToken(token);
    if (!verified) return false;

    return isAuthorizedAdmin({ email: verified.email, phone: verified.phone });
  } catch (error) {
    console.error("[Auth Helper] isAdminAuthenticated check failed:", error);
    return false;
  }
}
