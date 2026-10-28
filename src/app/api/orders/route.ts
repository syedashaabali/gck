import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdminAuthenticated } from "@/lib/auth";
import { INITIAL_STORE_SETTINGS } from "@/lib/seed-data";
import { isPincodeServiceable } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const scope = req.nextUrl.searchParams.get("scope");

    if (scope === "admin") {
      const isAdmin = await isAdminAuthenticated();
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Admin authorization required" },
          { status: 401 }
        );
      }

      const orders = await prisma.order.findMany({
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const todaysOrders = orders.filter(
        (o) => new Date(o.createdAt) >= startOfToday
      );

      const todayTotalOrders = todaysOrders.length;
      const activeKitchenLoad = orders.filter(
        (o) =>
          o.status === OrderStatus.RECEIVED ||
          o.status === OrderStatus.PREPARING
      ).length;
      const pendingCodCash = orders
        .filter((o) => o.status === OrderStatus.OUT_FOR_DELIVERY)
        .reduce((sum, o) => sum + o.grandTotal, 0);
      const todayDeliveredRevenue = todaysOrders
        .filter((o) => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + o.grandTotal, 0);

      return NextResponse.json({
        orders,
        kpis: {
          todayTotalOrders,
          activeKitchenLoad,
          pendingCodCash: Math.round(pendingCodCash * 100) / 100,
          todayDeliveredRevenue: Math.round(todayDeliveredRevenue * 100) / 100,
        },
      });
    }

    // Customer Order History
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to view your orders." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in with your mobile number to place an order." },
        { status: 401 }
      );
    }

    if (!user.isOnboarded) {
      return NextResponse.json(
        { error: "Please complete your delivery profile before ordering." },
        { status: 400 }
      );
    }

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: INITIAL_STORE_SETTINGS,
    });

    // 1. Check if kitchen is accepting orders
    if (!settings.isAcceptingOrders) {
      return NextResponse.json(
        {
          error:
            "Gulmarg Cloud Kitchen is currently offline and not accepting new orders.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const rawItems: Array<{ dishId: string; quantity: number }> = Array.isArray(
      body.items
    )
      ? body.items
      : [];

    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: "Your royal cart is empty." },
        { status: 400 }
      );
    }

    // Resolve delivery address
    const selectedAddress =
      (body.addressId
        ? user.addresses.find((a) => a.id === body.addressId)
        : null) ||
      user.addresses.find((a) => a.isDefault) ||
      user.addresses[0];

    const deliveryAddress =
      String(body.deliveryAddress || selectedAddress?.fullAddress || "").trim();
    const landmark =
      body.landmark !== undefined
        ? body.landmark
          ? String(body.landmark).trim()
          : null
        : selectedAddress?.landmark || null;
    const pincode = String(
      body.pincode || selectedAddress?.pincode || ""
    ).trim();
    const cookingNotes = body.cookingNotes
      ? String(body.cookingNotes).trim()
      : null;

    if (!deliveryAddress || !pincode) {
      return NextResponse.json(
        { error: "Please select or add a valid delivery address and pincode." },
        { status: 400 }
      );
    }

    // 2. Serviceable pincode check
    if (!isPincodeServiceable(pincode, settings.serviceablePincodes)) {
      return NextResponse.json(
        {
          error: `Pincode ${pincode} is currently outside our serviceable delivery zones (${settings.serviceablePincodes}).`,
        },
        { status: 400 }
      );
    }

    // 3. Fetch latest dishes from PostgreSQL & validate availability
    const dishIds = rawItems.map((i) => String(i.dishId));
    const dbDishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
    });
    const dishMap = new Map(dbDishes.map((d) => [d.id, d]));

    const unavailableDishes: string[] = [];
    for (const item of rawItems) {
      const dish = dishMap.get(item.dishId);
      if (!dish || !dish.isAvailable) {
        unavailableDishes.push(dish?.name || "Unavailable Dish");
      }
    }

    if (unavailableDishes.length > 0) {
      return NextResponse.json(
        {
          error: `Some items in your cart are now out of stock: ${unavailableDishes.join(
            ", "
          )}. Please remove them to proceed.`,
          unavailableDishIds: rawItems
            .filter((i) => {
              const d = dishMap.get(i.dishId);
              return !d || !d.isAvailable;
            })
            .map((i) => i.dishId),
        },
        { status: 400 }
      );
    }

    // 4. Calculate explicit bill breakdown on the server
    let subtotal = 0;
    let packagingTotal = 0;

    const orderItemsPayload = rawItems.map((item) => {
      const dish = dishMap.get(item.dishId)!;
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const itemTotal = Math.round(dish.price * qty * 100) / 100;
      subtotal += itemTotal;
      packagingTotal += dish.packagingCharge * qty;

      return {
        dishId: dish.id,
        dishName: dish.name,
        unitPrice: dish.price,
        packagingCharge: dish.packagingCharge,
        quantity: qty,
        itemTotal,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    packagingTotal = Math.round(packagingTotal * 100) / 100;

    if (subtotal < settings.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount is ₹${settings.minOrderAmount}. Please add ₹${(
            settings.minOrderAmount - subtotal
          ).toFixed(0)} more.`,
        },
        { status: 400 }
      );
    }

    const taxAmount =
      Math.round(
        (subtotal + packagingTotal) * (settings.taxPercentage / 100) * 100
      ) / 100;
    const deliveryFee =
      subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    const grandTotal =
      Math.round(
        (subtotal + packagingTotal + taxAmount + deliveryFee) * 100
      ) / 100;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerName: user.name || "Royal Guest",
        customerPhone: user.phone,
        deliveryAddress,
        landmark,
        pincode,
        cookingNotes,
        paymentMethod: "COD",
        status: OrderStatus.RECEIVED,
        subtotal,
        packagingTotal,
        taxAmount,
        deliveryFee,
        grandTotal,
        items: {
          create: orderItemsPayload,
        },
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
    console.error("[POST /api/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}
