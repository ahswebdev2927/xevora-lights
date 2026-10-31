import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET: Fetch all FAQs
export async function GET() {
  try {
    const list = await db
      .select()
      .from(faqs)
      .orderBy(asc(faqs.displayOrder));
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("GET FAQs Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add new FAQ
export async function POST(req: Request) {
  try {
    const { question, answer, displayOrder } = await req.json();

    if (!question || !answer) {
      return NextResponse.json({ success: false, error: "Question and Answer are required" }, { status: 400 });
    }

    const [newFaq] = await db
      .insert(faqs)
      .values({
        question,
        answer,
        displayOrder: displayOrder || 0,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, data: newFaq });
  } catch (error: any) {
    console.error("POST FAQ Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update FAQ
export async function PUT(req: Request) {
  try {
    const { id, question, answer, displayOrder } = await req.json();

    if (!id || !question || !answer) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
    }

    const [updatedFaq] = await db
      .update(faqs)
      .set({
        question,
        answer,
        displayOrder: displayOrder || 0,
      })
      .where(eq(faqs.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedFaq });
  } catch (error: any) {
    console.error("PUT FAQ Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete FAQ
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await db.delete(faqs).where(eq(faqs.id, Number(id)));

    return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error: any) {
    console.error("DELETE FAQ Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
