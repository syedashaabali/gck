import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminAuthenticated } from "@/lib/auth";
import { INITIAL_STORE_SETTINGS } from "@/lib/seed-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [order, settings, user, isAdmin] = await Promise.all([
      prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      }),
      prisma.storeSettings.upsert({
        where: { id: "default" },
        update: {},
        create: INITIAL_STORE_SETTINGS,
      }),
      getCurrentUser(),
      isAdminAuthenticated(),
    ]);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Allow access to the owning customer or admin
    if (!isAdmin && (!user || order.userId !== user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      order,
      settings,
    });
  } catch (error) {
    console.error("[GET /api/orders/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
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

    const validStatuses: OrderStatus[] = [
      OrderStatus.RECEIVED,
      OrderStatus.PREPARING,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ];

    const status = body.status as OrderStatus;
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    const cancellationNote =
      status === OrderStatus.CANCELLED
        ? String(
            body.cancellationNote || "Order cancelled by kitchen."
          ).trim()
        : body.cancellationNote !== undefined
        ? body.cancellationNote
        : undefined;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(cancellationNote !== undefined ? { cancellationNote } : {}),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("[PATCH /api/orders/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
