import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthenticated,
  signAdminToken,
} from "@/lib/auth";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passcode = String(body.passcode || "").trim();
    const expectedPasscode = process.env.ADMIN_PASSCODE || "123456";

    if (passcode !== expectedPasscode) {
      return NextResponse.json(
        { error: "Invalid Admin Passcode. Access denied." },
        { status: 401 }
      );
    }

    const token = await signAdminToken();
    const res = NextResponse.json({
      success: true,
      authenticated: true,
    });

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("[POST /api/admin/auth] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, authenticated: false });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
