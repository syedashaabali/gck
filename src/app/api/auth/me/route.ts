import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user: user || null });
  } catch (error) {
    console.error("[GET /api/auth/me] Error:", error);
    return NextResponse.json({ user: null });
  }
}
