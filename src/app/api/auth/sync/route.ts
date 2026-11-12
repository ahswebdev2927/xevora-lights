import { NextResponse } from "next/server";
import { POST as handleGoogleSync } from "@/app/api/auth/google-sync/route";

export async function POST(request: Request) {
  // Delegate synchronization to the central google-sync handler
  return handleGoogleSync(request);
}
