import { NextResponse } from "next/server";
import { db } from "@/db";
import { productReviews, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const phoneNumber = await getVerifiedPhoneFromCookie("auth_session");
    if (!phoneNumber) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userRows = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    if (!userRows.length) {
      return NextResponse.json({ success: true, data: [] });
    }
    const user = userRows[0];

    const reviews = await db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        orderId: productReviews.orderId,
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        status: productReviews.status,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .where(eq(productReviews.userId, user.id));

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error("Fetch User Reviews Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch user reviews." }, { status: 500 });
  }
}
