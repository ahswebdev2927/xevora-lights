import { NextResponse } from "next/server";
import { db } from "@/db";
import { productReviews, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const productId = Number(id);

    if (!productId) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    const reviews = await db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        title: productReviews.title,
        comment: productReviews.comment,
        status: productReviews.status,
        createdAt: productReviews.createdAt,
        userName: users.fullName,
      })
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved")))
      .orderBy(desc(productReviews.createdAt));

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1))
        : 5.0;

    return NextResponse.json({
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt,
        author: r.userName || "Verified Studio Owner",
        role: "Verified Buyer",
      })),
      stats: {
        totalReviews,
        averageRating,
      },
    });
  } catch (error: any) {
    console.error("Fetch Product Reviews Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load product reviews." },
      { status: 500 }
    );
  }
}
