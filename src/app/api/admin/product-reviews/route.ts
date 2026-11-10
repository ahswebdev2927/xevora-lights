import { NextResponse } from "next/server";
import { db } from "@/db";
import { productReviews, products, users, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminRequest } from "@/utils/auth";

export const dynamic = "force-dynamic";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// GET: Fetch all product reviews for admin moderation
export async function GET(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        productName: products.name,
        productImage: products.images,
        userId: productReviews.userId,
        userName: users.fullName,
        userPhone: users.phoneNumber,
        userEmail: users.email,
        orderId: productReviews.orderId,
        orderTotal: orders.totalAmount,
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        status: productReviews.status,
        createdAt: productReviews.createdAt,
        updatedAt: productReviews.updatedAt,
      })
      .from(productReviews)
      .leftJoin(products, eq(productReviews.productId, products.id))
      .leftJoin(users, eq(productReviews.userId, users.id))
      .leftJoin(orders, eq(productReviews.orderId, orders.id))
      .orderBy(desc(productReviews.createdAt));

    // Parse product image if needed
    const parsed = list.map((item) => {
      let firstImage: string | null = null;
      if (item.productImage) {
        try {
          const arr = JSON.parse(item.productImage);
          if (Array.isArray(arr) && arr.length > 0) firstImage = arr[0];
        } catch {
          firstImage = item.productImage;
        }
      }
      return {
        ...item,
        firstImage,
      };
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Admin Fetch Product Reviews Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

// PUT: Update review status (approve, reject) or content
export async function PUT(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, title, comment, rating } = body;

    const reviewId = Number(id);
    if (!reviewId) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      updateData.status = status;
    }
    if (title && typeof title === "string") {
      updateData.title = title.trim();
    }
    if (comment && typeof comment === "string") {
      updateData.comment = comment.trim();
    }
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      updateData.rating = Number(rating);
    }

    await db.update(productReviews).set(updateData).where(eq(productReviews.id, reviewId));

    return NextResponse.json({ success: true, message: "Review updated successfully." });
  } catch (error: any) {
    console.error("Admin Update Product Review Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update review" }, { status: 500 });
  }
}

// DELETE: Delete a product review
export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing review ID" }, { status: 400 });
    }

    await db.delete(productReviews).where(eq(productReviews.id, Number(id)));

    return NextResponse.json({ success: true, message: "Review deleted successfully." });
  } catch (error: any) {
    console.error("Admin Delete Product Review Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete review" }, { status: 500 });
  }
}
