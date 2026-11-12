import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/db/auth-helper";
import { createSessionToken } from "@/utils/auth-token";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser("auth_session");
    const body = await request.json().catch(() => ({}));
    const { fullName, email, whatsappNumber, phoneNumber, phone } = body;

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized: Active session required." }, { status: 401 });
    }

    if (!fullName && !email && !phoneNumber && !phone && !whatsappNumber) {
      return NextResponse.json({ success: false, error: "No profile details provided to update." }, { status: 400 });
    }

    const updatedPhone = phoneNumber || phone;

    // Update user profile in DB by unique ID
    await db.update(users)
      .set({
        ...(fullName ? { fullName } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(whatsappNumber ? { whatsappNumber } : {}),
        ...(updatedPhone ? { phoneNumber: updatedPhone } : {}),
      })
      .where(eq(users.id, user.id));

    const response = NextResponse.json({ success: true, message: "Profile updated successfully" });

    // Refresh session token with updated phone
    if (user.email) {
      const refreshedToken = await createSessionToken({
        email: user.email,
        phone: updatedPhone || user.phoneNumber || undefined,
        role: (user.role as "admin" | "user") || "user",
        userId: user.id,
      });

      response.cookies.set("auth_session", refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    if (error?.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ success: false, error: "This mobile number is already linked to another account." }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
