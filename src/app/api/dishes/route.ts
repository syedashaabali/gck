import { NextRequest, NextResponse } from "next/server";
import { DietaryType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { INITIAL_STORE_SETTINGS } from "@/lib/seed-data";

export async function GET(req: NextRequest) {
  try {
    const includeAll = req.nextUrl.searchParams.get("all") === "true";

    const [settings, categories, dishes] = await Promise.all([
      prisma.storeSettings.upsert({
        where: { id: "default" },
        update: {},
        create: INITIAL_STORE_SETTINGS,
      }),
      prisma.category.findMany({
        where: includeAll ? {} : { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.dish.findMany({
        where: includeAll
          ? {}
          : {
              category: {
                isActive: true,
              },
            },
        include: {
          category: true,
        },
        orderBy: [
          { category: { sortOrder: "asc" } },
          { isSignature: "desc" },
          { createdAt: "asc" },
        ],
      }),
    ]);

    return NextResponse.json({
      settings,
      categories,
      dishes,
    });
  } catch (error) {
    console.error("[GET /api/dishes] Error:", error);
    return NextResponse.json(
      { error: "Failed to load menu from PostgreSQL" },
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
    const description = String(body.description || "").trim();
    const categoryId = String(body.categoryId || "").trim();
    const price = Number(body.price);
    const packagingCharge =
      body.packagingCharge !== undefined ? Number(body.packagingCharge) : 15.0;
    const dietaryType =
      body.dietaryType === "VEG" ? DietaryType.VEG : DietaryType.NON_VEG;
    const servesInfo = String(body.servesInfo || "Serves 1-2").trim();
    const imageUrl =
      String(body.imageUrl || "").trim() ||
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80";
    const isAvailable =
      body.isAvailable !== undefined ? Boolean(body.isAvailable) : true;
    const isSignature =
      body.isSignature !== undefined ? Boolean(body.isSignature) : false;

    if (!name || !description || !categoryId || isNaN(price) || price <= 0) {
      return NextResponse.json(
        {
          error:
            "Dish Name, Description, Category, and a valid Price are required.",
        },
        { status: 400 }
      );
    }

    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        categoryId,
        price,
        packagingCharge: isNaN(packagingCharge) ? 15.0 : packagingCharge,
        dietaryType,
        servesInfo,
        imageUrl,
        isAvailable,
        isSignature,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ dish });
  } catch (error) {
    console.error("[POST /api/dishes] Error:", error);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}
