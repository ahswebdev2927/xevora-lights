import { NextResponse } from "next/server";
import { db } from "@/db";
import { wishlists, products, productVariations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/db/auth-helper";

export async function GET() {
  try {
    const user = await getAuthenticatedUser("auth_session");
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const dbWishlist = await db.select({
      id: wishlists.id,
      productId: wishlists.productId,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        basePrice: products.basePrice,
        salePrice: products.salePrice,
        images: products.images,
        colors: products.colors,
        category: products.category,
        isCustomizable: products.isCustomizable,
        specifications: products.specifications,
        createdAt: products.createdAt,
      }
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, user.id));

    // Fetch variations for each product to calculate real-time stock
    const itemsWithStock = await Promise.all(dbWishlist.map(async (item) => {
      const variations = await db.select()
        .from(productVariations)
        .where(eq(productVariations.productId, item.productId));

      const totalStock = variations.reduce((sum, v) => sum + (v.stock || 0), 0);

      return {
        ...item,
        product: {
          ...item.product,
          stock: totalStock,
          variations,
        }
      };
    }));

    return NextResponse.json({ success: true, items: itemsWithStock });
  } catch (error: any) {
    console.error("Wishlist Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser("auth_session");
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    // Check if product exists
    const productResult = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (productResult.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Check if already exists in wishlist
    const existing = await db.select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: true, message: "Product already in wishlist" });
    }

    await db.insert(wishlists).values({
      userId: user.id,
      productId: productId,
    });

    return NextResponse.json({ success: true, message: "Product added to wishlist" });
  } catch (error: any) {
    console.error("Wishlist Add Error:", error);
    return NextResponse.json({ success: false, error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser("auth_session");
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productIdStr = searchParams.get("productId");
    if (!productIdStr) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const productId = parseInt(productIdStr);
    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 });
    }

    await db.delete(wishlists)
      .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));

    return NextResponse.json({ success: true, message: "Product removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist Delete Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete from wishlist" }, { status: 500 });
  }
}
