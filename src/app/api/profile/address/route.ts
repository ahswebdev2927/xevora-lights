import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/db/auth-helper";

// Helper: parse stored address field → string[]
function parseAddresses(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser("auth_session");
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const addresses = parseAddresses(user.address);
    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Address GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const user = await getAuthenticatedUser("auth_session");

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const addresses = parseAddresses(user.address);
    if (!addresses.includes(address)) {
      addresses.push(address);
    }

    await db.update(users)
      .set({ address: JSON.stringify(addresses) })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Address POST Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { address } = await req.json();
    const user = await getAuthenticatedUser("auth_session");

    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const addresses = parseAddresses(user.address).filter((a) => a !== address);

    await db.update(users)
      .set({ address: addresses.length > 0 ? JSON.stringify(addresses) : null })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
