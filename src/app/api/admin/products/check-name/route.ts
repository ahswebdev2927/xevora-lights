import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, ne, sql } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "";
    const excludeId = searchParams.get("excludeId");

    if (!name.trim()) {
      return NextResponse.json({ success: true, exists: false });
    }

    let query = db
      .select({ id: products.id })
      .from(products)
      .where(sql`lower(${products.name}) = lower(${name.trim()})`);

    if (excludeId) {
      const parsedId = parseInt(excludeId);
      if (!isNaN(parsedId)) {
        query = db
          .select({ id: products.id })
          .from(products)
          .where(
            and(
              sql`lower(${products.name}) = lower(${name.trim()})`,
              ne(products.id, parsedId)
            )
          );
      }
    }

    const existing = await query.limit(1);

    return NextResponse.json({ success: true, exists: existing.length > 0 });
  } catch (error) {
    console.error("Error checking product name:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
