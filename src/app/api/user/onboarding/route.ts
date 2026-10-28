import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Please sign in first to complete your profile." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    const fullAddress = String(body.fullAddress || "").trim();
    const landmark = body.landmark ? String(body.landmark).trim() : null;
    const pincode = String(body.pincode || "").trim();
    const label = String(body.label || "Home").trim() || "Home";

    if (!name || !fullAddress || !pincode) {
      return NextResponse.json(
        {
          error:
            "Full Name, Complete Delivery Address, and Pincode are required.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // Unset any previous default addresses for this user
      await tx.address.updateMany({
        where: { userId: currentUser.id },
        data: { isDefault: false },
      });

      await tx.address.create({
        data: {
          userId: currentUser.id,
          label,
          fullAddress,
          landmark,
          pincode,
          isDefault: true,
        },
      });

      return tx.user.update({
        where: { id: currentUser.id },
        data: {
          name,
          isOnboarded: true,
        },
        include: {
          addresses: {
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[POST /api/user/onboarding] Error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding details." },
      { status: 500 }
    );
  }
}
