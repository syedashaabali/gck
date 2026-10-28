"use client";

import React, { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Banknote,
  CheckCircle2,
  ChefHat,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  Sparkles,
  Truck,
  XOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SiteHeaderLite } from "@/components/storefront/SiteHeaderLite";
import { BillRow } from "@/components/storefront/BillRow";
import { cn, formatINR } from "@/lib/utils";
import type { StoreSettingsRecord } from "@/components/storefront/CartSheet";

interface OrderItemRecord {
  id: string;
  dishId: string | null;
  dishName: string;
  unitPrice: number;
  packagingCharge: number;
  quantity: number;
  itemTotal: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  landmark: string | null;
  pincode: string;
  cookingNotes: string | null;
  paymentMethod: string;
  status:
    | "RECEIVED"
    | "PREPARING"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
  cancellationNote: string | null;
  subtotal: number;
  packagingTotal: number;
  taxAmount: number;
  deliveryFee: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const STAGES = [
  {
    key: "RECEIVED",
    title: "Order received",
    subtitle: "Your order has been received by Gulmarg Cloud Kitchen",
    icon: Receipt,
  },
  {
    key: "PREPARING",
    title: "Preparing in kitchen",
    subtitle: "Our chefs are freshly preparing your delicacies",
    icon: ChefHat,
  },
  {
    key: "OUT_FOR_DELIVERY",
    title: "Out for delivery",
    subtitle: "Our delivery valet is on the way to your address",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    title: "Delivered",
    subtitle: "Enjoy your royal feast!",
    icon: Sparkles,
  },
] as const;

export default function LiveOrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Poll PostgreSQL every 4 seconds for real-time status progression
  const { data, isLoading } = useSWR<{
    order?: OrderRecord;
    settings?: StoreSettingsRecord;
    error?: string;
  }>(`/api/orders/${id}`, fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });

  const order = data?.order;
  const settings = data?.settings;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeaderLite backHref="/orders" backLabel="All orders" title="Order" />
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl font-semibold">Order not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data?.error ||
            "We couldn't locate this order — you may need to sign in."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Return to the menu</Link>
        </Button>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === order.status);
  const whatsappClean = (settings?.whatsappNumber || "+919876543210").replace(
    /\D/g,
    ""
  );
  const whatsappMessage = encodeURIComponent(
    `Hello Gulmarg Cloud Kitchen, I need assistance with my Order #${order.orderNumber} (Name: ${order.customerName}).`
  );

  return (
    <div className="min-h-screen pb-16">
      <SiteHeaderLite
        backHref="/orders"
        backLabel="All orders"
        eyebrow="Live tracking"
        title={`Order #${order.orderNumber}`}
        right={
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 border-jade-light/40 text-jade-light hover:border-jade-light hover:bg-jade/20 hover:text-jade-light"
          >
            <a
              href={`https://wa.me/${whatsappClean}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle />
              <span className="max-sm:sr-only">WhatsApp Kitchen</span>
            </a>
          </Button>
        }
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {order.status === "CANCELLED" ? (
          <section className="relative overflow-hidden rounded-2xl border border-ruby-light/50 bg-gradient-to-br from-ruby/35 via-ruby/15 to-card p-6 shadow-ruby md:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-ruby-light/50 bg-ruby/30 text-ruby-light">
                <XOctagon className="size-7" />
              </span>
              <div className="space-y-2">
                <Badge variant="destructive" className="uppercase tracking-[0.2em]">
                  Order cancelled
                </Badge>
                <h2 className="font-serif text-3xl font-semibold">
                  This order has been cancelled
                </h2>
                <p className="text-sm text-foreground/80">
                  <strong className="text-ruby-light">Kitchen note:</strong>{" "}
                  {order.cancellationNote ||
                    "Cancelled by Gulmarg Cloud Kitchen."}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="glass rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Real-time kitchen status</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold md:text-4xl">
                  {STAGES[currentStageIndex]?.title || "Order status"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {STAGES[currentStageIndex]?.subtitle}
                </p>
              </div>
              <Badge variant="success" className="gap-2 px-3 py-1">
                <span className="size-2 animate-pulse-ring rounded-full bg-jade-light" />
                Live · updates every 4s
              </Badge>
            </div>

            <ol className="mt-10 grid gap-8 sm:grid-cols-4 sm:gap-4">
              {STAGES.map((stage, index) => {
                const Icon = stage.icon;
                const completed = index < currentStageIndex;
                const current = index === currentStageIndex;
                const reached = index <= currentStageIndex;
                return (
                  <li
                    key={stage.key}
                    className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
                  >
                    {index < STAGES.length - 1 && (
                      <>
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-6 top-[3.25rem] h-[calc(100%-1.5rem)] w-px sm:hidden",
                            completed ? "bg-primary" : "bg-white/10"
                          )}
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "absolute left-[calc(50%+1.75rem)] top-6 hidden h-px w-[calc(100%-3.5rem+1rem)] sm:block",
                            completed ? "bg-primary" : "bg-white/10"
                          )}
                        />
                      </>
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border transition",
                        completed &&
                          "border-primary bg-gold-gradient text-primary-foreground",
                        current &&
                          "animate-pulse-ring border-primary bg-gold-gradient text-primary-foreground shadow-gold-lg",
                        !reached &&
                          "border-white/15 bg-card text-muted-foreground"
                      )}
                    >
                      {completed ? (
                        <CheckCircle2 className="size-6" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "font-serif text-base font-semibold",
                          !reached && "text-muted-foreground"
                        )}
                      >
                        {stage.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {stage.subtitle}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <div className="grid gap-6 md:grid-cols-5">
          {/* Delivery details */}
          <section className="glass space-y-4 rounded-2xl p-6 md:col-span-2">
            <h3 className="font-serif text-xl font-semibold text-gold-gradient">
              Delivery details
            </h3>
            <Separator />
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="mt-0.5 leading-relaxed text-foreground/80">
                    {order.deliveryAddress}
                  </p>
                  {order.landmark && (
                    <p className="text-muted-foreground">
                      Landmark: {order.landmark}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-xs text-primary">
                    PIN {order.pincode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>+91 {order.customerPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Banknote className="size-4 shrink-0 text-primary" />
                <span>Cash / UPI on delivery</span>
              </div>
              {order.cookingNotes && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                  <p className="eyebrow !text-[0.6rem]">Note for the chef</p>
                  <p className="mt-1.5 font-script text-lg italic leading-snug">
                    &ldquo;{order.cookingNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Invoice */}
          <section className="glass rounded-2xl p-6 md:col-span-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-semibold text-gold-gradient">
                  Itemised invoice
                </h3>
                <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground">
                  FSSAI Lic. {settings?.fssaiNumber || "—"}
                </p>
              </div>
              <Badge variant="outline">#{order.orderNumber}</Badge>
            </div>
            <Separator className="my-4" />

            <ul className="divide-y divide-white/5">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base font-semibold">
                      <span className="mr-2 font-sans text-sm font-bold text-primary">
                        {item.quantity}×
                      </span>
                      {item.dishName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatINR(item.unitPrice)} each · +
                      {formatINR(item.packagingCharge)} packaging
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatINR(item.itemTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2.5 border-t border-primary/20 pt-4">
              <BillRow label="Item subtotal" value={formatINR(order.subtotal)} />
              <BillRow
                label="Packaging"
                value={formatINR(order.packagingTotal)}
              />
              <BillRow label="GST" value={formatINR(order.taxAmount)} />
              <BillRow
                label="Delivery"
                value={
                  order.deliveryFee === 0 ? (
                    <span className="font-semibold text-jade-light">FREE</span>
                  ) : (
                    formatINR(order.deliveryFee)
                  )
                }
              />
              <div className="my-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <BillRow
                strong
                label="Grand total (collect on delivery)"
                value={formatINR(order.grandTotal)}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
