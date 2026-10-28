import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { INITIAL_STORE_SETTINGS } from "@/lib/seed-data";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: INITIAL_STORE_SETTINGS,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[GET /api/settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to load store settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin authorization required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        ...(body.storeName !== undefined
          ? { storeName: String(body.storeName).trim() }
          : {}),
        ...(body.isAcceptingOrders !== undefined
          ? { isAcceptingOrders: Boolean(body.isAcceptingOrders) }
          : {}),
        ...(body.deliveryFee !== undefined
          ? { deliveryFee: Math.max(0, Number(body.deliveryFee) || 0) }
          : {}),
        ...(body.freeDeliveryThreshold !== undefined
          ? {
              freeDeliveryThreshold: Math.max(
                0,
                Number(body.freeDeliveryThreshold) || 0
              ),
            }
          : {}),
        ...(body.minOrderAmount !== undefined
          ? { minOrderAmount: Math.max(0, Number(body.minOrderAmount) || 0) }
          : {}),
        ...(body.taxPercentage !== undefined
          ? { taxPercentage: Math.max(0, Number(body.taxPercentage) || 0) }
          : {}),
        ...(body.whatsappNumber !== undefined
          ? { whatsappNumber: String(body.whatsappNumber).trim() }
          : {}),
        ...(body.fssaiNumber !== undefined
          ? { fssaiNumber: String(body.fssaiNumber).trim() }
          : {}),
        ...(body.serviceablePincodes !== undefined
          ? {
              serviceablePincodes:
                String(body.serviceablePincodes).trim() || "ALL",
            }
          : {}),
      },
      create: INITIAL_STORE_SETTINGS,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("[PATCH /api/settings] Error:", error);
    return NextResponse.json(
      { error: "Failed to update store settings" },
      { status: 500 }
    );
  }
}
