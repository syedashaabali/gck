import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = String(body.phone || "").replace(/\D/g, "");
    const phone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Check 30-second resend cooldown
    const recentOtp = await prisma.otpVerification.findFirst({
      where: {
        phone,
        createdAt: {
          gt: new Date(Date.now() - 30 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentOtp) {
      const waitSeconds = Math.max(
        1,
        Math.ceil(
          (recentOtp.createdAt.getTime() + 30 * 1000 - Date.now()) / 1000
        )
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitSeconds}s before requesting another OTP.`,
          cooldownRemaining: waitSeconds,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await prisma.otpVerification.create({
      data: {
        phone,
        code,
        attempts: 0,
        expiresAt,
        verified: false,
      },
    });

    const smsResult = await sendOtpSms(phone, code);

    if (!smsResult.delivered && smsResult.mode === "production") {
      return NextResponse.json(
        {
          error:
            smsResult.providerError ||
            "Failed to dispatch SMS via Fast2SMS. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP dispatched to your mobile number.",
      phone,
      expiresAt: expiresAt.toISOString(),
      mode: smsResult.mode,
      ...(smsResult.devOtp ? { devOtp: smsResult.devOtp } : {}),
      ...(smsResult.providerError
        ? { providerError: smsResult.providerError }
        : {}),
    });
  } catch (error) {
    console.error("[POST /api/auth/send-otp] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate OTP. Please try again." },
      { status: 500 }
    );
  }
}
