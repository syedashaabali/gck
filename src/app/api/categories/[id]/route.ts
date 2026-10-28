import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

    const updateData: {
      name?: string;
      slug?: string;
      sortOrder?: number;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      updateData.name = String(body.name).trim();
    }
    if (body.slug !== undefined) {
      updateData.slug = slugify(String(body.slug));
    }
    if (body.sortOrder !== undefined) {
      updateData.sortOrder = Number(body.sortOrder);
    }
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[PATCH /api/categories/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/categories/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
