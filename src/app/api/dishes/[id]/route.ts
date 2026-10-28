import { NextRequest, NextResponse } from "next/server";
import { DietaryType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
        ...(body.description !== undefined
          ? { description: String(body.description).trim() }
          : {}),
        ...(body.categoryId !== undefined
          ? { categoryId: String(body.categoryId).trim() }
          : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(body.packagingCharge !== undefined
          ? { packagingCharge: Number(body.packagingCharge) }
          : {}),
        ...(body.dietaryType !== undefined
          ? {
              dietaryType:
                body.dietaryType === "VEG"
                  ? DietaryType.VEG
                  : DietaryType.NON_VEG,
            }
          : {}),
        ...(body.servesInfo !== undefined
          ? { servesInfo: String(body.servesInfo).trim() }
          : {}),
        ...(body.imageUrl !== undefined
          ? { imageUrl: String(body.imageUrl).trim() }
          : {}),
        ...(body.isAvailable !== undefined
          ? { isAvailable: Boolean(body.isAvailable) }
          : {}),
        ...(body.isSignature !== undefined
          ? { isSignature: Boolean(body.isSignature) }
          : {}),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ dish });
  } catch (error) {
    console.error("[PATCH /api/dishes/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to update dish" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.dish.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/dishes/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}
