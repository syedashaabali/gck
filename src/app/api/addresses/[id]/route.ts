import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updated = await prisma.$transaction(async (tx) => {
      if (body.isDefault === true) {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          ...(body.label !== undefined ? { label: String(body.label).trim() } : {}),
          ...(body.fullAddress !== undefined
            ? { fullAddress: String(body.fullAddress).trim() }
            : {}),
          ...(body.landmark !== undefined
            ? { landmark: body.landmark ? String(body.landmark).trim() : null }
            : {}),
          ...(body.pincode !== undefined
            ? { pincode: String(body.pincode).trim() }
            : {}),
          ...(body.isDefault !== undefined
            ? { isDefault: Boolean(body.isDefault) }
            : {}),
        },
      });
    });

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ address: updated, addresses });
  } catch (error) {
    console.error("[PATCH /api/addresses/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    await prisma.address.delete({ where: { id } });

    // If the deleted address was default, promote the newest remaining address
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("[DELETE /api/addresses/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
