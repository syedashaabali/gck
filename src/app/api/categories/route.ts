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

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/categories] Error:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(body.slug ? String(body.slug) : name) || "category";
    let slug = baseSlug;
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await prisma.category.count();
    const sortOrder =
      body.sortOrder !== undefined ? Number(body.sortOrder) : count + 1;
    const isActive =
      body.isActive !== undefined ? Boolean(body.isActive) : true;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        sortOrder,
        isActive,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[POST /api/categories] Error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
