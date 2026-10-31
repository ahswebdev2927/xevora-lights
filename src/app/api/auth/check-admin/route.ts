import { NextResponse } from "next/server";
import { isAdminPhone } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const isAdmin = isAdminPhone(phone);
    return NextResponse.json({ success: true, isAdmin });
  } catch (error: any) {
    console.error("Check Admin API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
