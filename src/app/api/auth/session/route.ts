import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/db/auth-helper";

export async function GET() {
  try {
    let user = await getAuthenticatedUser("auth_session");
    if (!user) {
      user = await getAuthenticatedUser("admin_session");
    }

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    const cleanPhone = (user.phoneNumber && /^\d{10}$/.test(user.phoneNumber))
      ? user.phoneNumber
      : "";

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        phoneNumber: cleanPhone,
        fullName: user.fullName || "",
        email: user.email || "",
        whatsappNumber: (user.whatsappNumber && /^\d{10}$/.test(user.whatsappNumber)) ? user.whatsappNumber : cleanPhone,
        role: user.role || "user",
        address: user.address || "",
      },
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
