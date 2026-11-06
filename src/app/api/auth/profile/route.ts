import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";

export async function POST(request: Request) {
  try {
    const cookiePhone = await getVerifiedPhoneFromCookie("auth_session");
    const body = await request.json();
    const { fullName, email, whatsappNumber, phone: bodyPhone } = body;

    const targetPhone = cookiePhone || bodyPhone;

    if (!targetPhone) {
      return NextResponse.json({ success: false, error: "Unauthorized: No phone session found" }, { status: 401 });
    }

    if (!fullName) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    // Update user profile in DB
    await db.update(users)
      .set({ 
        fullName,
        ...(email ? { email } : {}),
        ...(whatsappNumber ? { whatsappNumber } : {})
      })
      .where(eq(users.phoneNumber, targetPhone));

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
