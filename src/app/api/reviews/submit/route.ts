import { NextResponse } from "next/server";
import { db } from "@/db";
import { productReviews, orders, orderItems, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getVerifiedPhoneFromCookie } from "@/db/auth-helper";

export async function POST(request: Request) {
  try {
    const phoneNumber = await getVerifiedPhoneFromCookie("auth_session");
    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: "Please sign in to write a review." }, { status: 401 });
    }

    const userRows = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    if (!userRows.length) {
      return NextResponse.json({ success: false, error: "User account not found." }, { status: 404 });
    }
    const user = userRows[0];

    const body = await request.json();
    const { orderId, productId, rating, title, comment } = body;

    const numOrderId = Number(orderId);
    const numProductId = Number(productId);
    const numRating = Number(rating);

    if (!numOrderId || !numProductId) {
      return NextResponse.json({ success: false, error: "Order ID and Product ID are required." }, { status: 400 });
    }

    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Review headline must be at least 3 characters." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Review feedback body must be at least 5 characters." }, { status: 400 });
    }

    // 1. Verify that order exists and belongs to this user
    const orderRows = await db.select().from(orders).where(and(eq(orders.id, numOrderId), eq(orders.userId, user.id))).limit(1);
    if (!orderRows.length) {
      return NextResponse.json({ success: false, error: "Order not found in your account." }, { status: 404 });
    }
    const order = orderRows[0];

    // 2. Verify order status is Delivered
    if (!order.status || order.status.trim().toLowerCase() !== "delivered") {
      return NextResponse.json(
        { success: false, error: "Reviews can only be submitted for delivered orders." },
        { status: 403 }
      );
    }

    // 3. Verify that the product is actually an item inside this order
    const itemRows = await db
      .select()
      .from(orderItems)
      .where(and(eq(orderItems.orderId, numOrderId), eq(orderItems.productId, numProductId)))
      .limit(1);

    if (!itemRows.length) {
      return NextResponse.json({ success: false, error: "This product was not found in the specified order." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const cleanTitle = title.trim();
    const cleanComment = comment.trim();

    // 4. Check if review already exists for this (orderId, productId, userId)
    const existingReviews = await db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.orderId, numOrderId),
          eq(productReviews.productId, numProductId),
          eq(productReviews.userId, user.id)
        )
      )
      .limit(1);

    if (existingReviews.length > 0) {
      // Update existing review and set back to pending for re-moderation
      await db
        .update(productReviews)
        .set({
          rating: numRating,
          title: cleanTitle,
          comment: cleanComment,
          status: "pending",
          updatedAt: now,
        })
        .where(eq(productReviews.id, existingReviews[0].id));

      return NextResponse.json({
        success: true,
        message: "Your review has been updated and submitted for approval.",
      });
    }

    // 5. Insert new review
    await db.insert(productReviews).values({
      productId: numProductId,
      userId: user.id,
      orderId: numOrderId,
      rating: numRating,
      title: cleanTitle,
      comment: cleanComment,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your verified review has been submitted and is pending approval.",
    });
  } catch (error: any) {
    console.error("Submit Product Review Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review." },
      { status: 500 }
    );
  }
}
