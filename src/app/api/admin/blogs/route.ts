import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogs } from "@/db/schema";
import { eq } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// POST: Add a new blog
export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, summary, content, coverImage, author } = body;

    if (!title || !slug || !summary || !content || !coverImage) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    await db.insert(blogs).values({
      title,
      slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
      summary,
      content,
      coverImage,
      author: author || "Admin",
      publishedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Add Blog Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to add blog" }, { status: 500 });
  }
}

// PUT: Update an existing blog
export async function PUT(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, slug, summary, content, coverImage, author } = body;

    if (!id || !title || !slug || !summary || !content || !coverImage) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    await db.update(blogs)
      .set({
        title,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        summary,
        content,
        coverImage,
        author: author || "Admin"
      })
      .where(eq(blogs.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Blog Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update blog" }, { status: 500 });
  }
}

// DELETE: Remove a blog
export async function DELETE(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await db.delete(blogs).where(eq(blogs.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Blog Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
