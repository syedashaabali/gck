import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("[GET /api/addresses] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const label = String(body.label || "Home").trim() || "Home";
    const fullAddress = String(body.fullAddress || "").trim();
    const landmark = body.landmark ? String(body.landmark).trim() : null;
    const pincode = String(body.pincode || "").trim();
    const isDefault = body.isDefault !== undefined ? Boolean(body.isDefault) : true;

    if (!fullAddress || !pincode) {
      return NextResponse.json(
        { error: "Complete delivery address and pincode are required." },
        { status: 400 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: user.id,
          label,
          fullAddress,
          landmark,
          pincode,
          isDefault,
        },
      });
    });

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ address, addresses });
  } catch (error) {
    console.error("[POST /api/addresses] Error:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
