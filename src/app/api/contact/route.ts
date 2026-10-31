import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, comment } = body;

    if (!name || !email || !comment) {
      return NextResponse.json(
        { error: "Name, email, and comment are required fields." },
        { status: 400 }
      );
    }

    console.log("Contact form submission received:", { name, email, phone, comment });

    return NextResponse.json({
      success: true,
      message: "Thank you for contacting us! We will get back to you shortly.",
    });
  } catch (error) {
    console.error("Error handling contact submission:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
