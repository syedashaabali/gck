import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { seedRoyalGulmargMenu } from "@/lib/seed-data";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    const dishCount = await prisma.dish.count();

    // Allow seeding if Admin is authenticated OR if database is completely empty
    if (!isAdmin && dishCount > 0) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 401 }
      );
    }

    let forceReset = false;
    try {
      const body = await req.json();
      forceReset = Boolean(body?.force);
    } catch {
      // No JSON body provided
    }

    const result = await seedRoyalGulmargMenu(forceReset);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/seed] Error:", error);
    return NextResponse.json(
      { error: "Failed to seed Royal Gulmarg Menu" },
      { status: 500 }
    );
  }
}
