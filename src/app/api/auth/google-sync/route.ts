import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { isAdminEmail } from "@/utils/admin-helper";
import { verifyFirebaseIdToken, createSessionToken } from "@/utils/auth-token";
import { db, client } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: Request) {
  try {
    // Ensure email & firebase_uid columns exist on users table and remove legacy unique phone constraint
    await client.execute("ALTER TABLE users ADD COLUMN email TEXT;").catch(() => {});
    await client.execute("ALTER TABLE users ADD COLUMN firebase_uid TEXT;").catch(() => {});
    await client.execute("DROP INDEX IF EXISTS users_phone_number_unique;").catch(() => {});
    await client.execute("UPDATE users SET phone_number = NULL WHERE phone_number = '';").catch(() => {});

    const body = await request.json().catch(() => ({}));
    const { idToken, targetRole = "user" } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "Firebase ID Token is required." },
        { status: 400 }
      );
    }

    // 1. Cryptographically verify Firebase ID Token via Google's official JWKS
    const verified = await verifyFirebaseIdToken(idToken);
    if (!verified || !verified.email) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired Firebase authentication token." },
        { status: 401 }
      );
    }

    const email = verified.email.toLowerCase();
    const displayName = verified.name || email.split("@")[0];
    const uid = verified.uid;

    // 2. Handle Admin authentication flow
    if (targetRole === "admin") {
      if (!isAdminEmail(email)) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied. This email is not authorized for administrator access.",
          },
          { status: 403 }
        );
      }

      const existingAdmins = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let adminUser = existingAdmins[0];

      if (!adminUser) {
        const insertRes = await db.insert(users).values({
          email,
          fullName: displayName,
          role: "admin",
          firebaseUid: uid,
          phoneNumber: `admin_${uid}`,
          lastLoginAt: new Date().toISOString(),
        }).returning();
        adminUser = insertRes[0];
      } else {
        await db
          .update(users)
          .set({
            role: "admin",
            lastLoginAt: new Date().toISOString(),
            firebaseUid: uid,
            ...(!adminUser.fullName ? { fullName: displayName } : {}),
          })
          .where(eq(users.id, adminUser.id));
      }

      const sessionToken = await createSessionToken({
        email,
        role: "admin",
        userId: adminUser?.id,
        phone: (adminUser?.phoneNumber && /^\d{10}$/.test(adminUser.phoneNumber)) ? adminUser.phoneNumber : undefined,
      });

      const response = NextResponse.json({
        success: true,
        role: "admin",
        user: {
          id: adminUser?.id,
          email,
          fullName: adminUser?.fullName || displayName,
          phoneNumber: (adminUser?.phoneNumber && /^\d{10}$/.test(adminUser.phoneNumber)) ? adminUser.phoneNumber : "",
        },
      });

      response.cookies.set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return response;
    }

    // 3. Handle Customer authentication flow
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let customerUser = existingUsers[0];
    const isNewUser = !customerUser;

    if (!customerUser) {
      const insertRes = await db.insert(users).values({
        email,
        fullName: displayName,
        role: "user",
        firebaseUid: uid,
        phoneNumber: `google_${uid}`,
        lastLoginAt: new Date().toISOString(),
      }).returning();
      customerUser = insertRes[0];
    } else {
      await db
        .update(users)
        .set({
          lastLoginAt: new Date().toISOString(),
          firebaseUid: uid,
          ...(!customerUser.fullName ? { fullName: displayName } : {}),
        })
        .where(eq(users.id, customerUser.id));
    }

    const cleanCustomerPhone = (customerUser?.phoneNumber && /^\d{10}$/.test(customerUser.phoneNumber))
      ? customerUser.phoneNumber
      : "";

    const userRole = (customerUser?.role as "admin" | "user") || "user";
    const sessionToken = await createSessionToken({
      email,
      role: userRole,
      userId: customerUser?.id,
      phone: cleanCustomerPhone || undefined,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: customerUser?.id,
        email,
        fullName: customerUser?.fullName || displayName,
        phoneNumber: cleanCustomerPhone,
      },
    });

    response.cookies.set("auth_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Google Sync] Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during Google sign-in." },
      { status: 500 }
    );
  }
}
