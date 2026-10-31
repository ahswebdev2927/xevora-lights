import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const results = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
      if (results.length > 0) {
        return NextResponse.json({ success: true, data: results[0] });
      }
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    const allBlogs = await db.select().from(blogs).orderBy(blogs.publishedAt);
    allBlogs.reverse();

    return NextResponse.json({ success: true, data: allBlogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
