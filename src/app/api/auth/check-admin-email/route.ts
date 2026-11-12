import { NextResponse } from "next/server";
import { isAdminEmail } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, isAuthorized: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const isAuthorized = isAdminEmail(email);

    return NextResponse.json({
      success: true,
      isAuthorized,
      message: isAuthorized
        ? "Email is authorized for administrative access."
        : "This email is not authorized for administrative access.",
    });
  } catch (error: any) {
    console.error("[Check Admin Email] Error:", error);
    return NextResponse.json(
      { success: false, isAuthorized: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
