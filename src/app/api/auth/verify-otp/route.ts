import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signUserToken, USER_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone || "").replace(/\D/g, "");
    const phone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const code = String(body.code || "").trim();

    if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit phone and 6-digit OTP code." },
        { status: 400 }
      );
    }

    // Find latest unverified OTP record for this phone
    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        phone,
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOtp) {
      return NextResponse.json(
        { error: "No active OTP found. Please request a new code." },
        { status: 400 }
      );
    }

    if (latestOtp.attempts >= 5) {
      return NextResponse.json(
        {
          error:
            "Maximum verification attempts (5) exceeded. Please request a new OTP.",
        },
        { status: 429 }
      );
    }

    if (new Date() > latestOtp.expiresAt) {
      return NextResponse.json(
        { error: "This OTP has expired. Please request a fresh OTP." },
        { status: 400 }
      );
    }

    if (latestOtp.code !== code) {
      const updated = await prisma.otpVerification.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = Math.max(0, 5 - updated.attempts);
      return NextResponse.json(
        {
          error: `Incorrect OTP code. ${remaining} attempt${
            remaining === 1 ? "" : "s"
          } remaining.`,
        },
        { status: 401 }
      );
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: latestOtp.id },
      data: { verified: true },
    });

    // Upsert User record
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        isOnboarded: false,
      },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    const token = await signUserToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user,
    });

    res.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error) {
    console.error("[POST /api/auth/verify-otp] Error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
