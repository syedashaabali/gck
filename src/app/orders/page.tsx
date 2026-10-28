"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ArrowRight,
  Clock,
  MapPin,
  RotateCcw,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SiteHeaderLite } from "@/components/storefront/SiteHeaderLite";
import { formatINR } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/order-status";
import { useCartStore, type DishRecord } from "@/store/useCartStore";
import type { OrderRecord } from "./[id]/page";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
      <Icon className="mx-auto size-10 text-primary" />
      <h2 className="mt-4 font-serif text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-6">
        <Link href="/">{cta}</Link>
      </Button>
    </div>
  );
}

export default function CustomerOrderHistoryPage() {
  const router = useRouter();
  const populateFromOrder = useCartStore((s) => s.populateFromOrder);

  const { data: ordersData, isLoading } = useSWR<{
    orders?: OrderRecord[];
    error?: string;
  }>("/api/orders", fetcher, {
    refreshInterval: 4000,
  });

  const { data: menuData } = useSWR<{ dishes: DishRecord[] }>(
    "/api/dishes",
    fetcher
  );

  const orders = ordersData?.orders || [];
  const latestDishes = menuData?.dishes || [];

  const handleReorder = (order: OrderRecord) => {
    if (latestDishes.length === 0) {
      toast.error("Menu is still loading. Please try again in a moment.");
      return;
    }

    const { addedCount, unavailableNames } = populateFromOrder(
      order.items,
      latestDishes
    );

    if (addedCount === 0) {
      toast.error(
        "None of the dishes from this past order are currently in stock."
      );
      return;
    }

    if (unavailableNames.length > 0) {
      toast.warning(
        `Added ${addedCount} dishes to your cart. Skipped unavailable: ${unavailableNames.join(
          ", "
        )}`
      );
    } else {
      toast.success(
        `Reordered ${addedCount} dishes from Order #${order.orderNumber}`
      );
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen pb-16">
      <SiteHeaderLite
        backHref="/"
        backLabel="Back to menu"
        eyebrow="Order history"
        title="My Orders"
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : ordersData?.error ? (
          <EmptyState
            icon={ScrollText}
            title="Sign in to view your orders"
            body="Sign in with your mobile number on the storefront to see your order history and live kitchen status."
            cta="Go to the storefront"
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No orders yet"
            body="Your past and active feasts will appear here once you place your first order."
            cta="Explore the menu"
          />
        ) : (
          <ul className="space-y-5">
            {orders.map((order) => {
              const meta = ORDER_STATUS[order.status];
              return (
                <li
                  key={order.id}
                  className="glass overflow-hidden rounded-2xl transition hover:border-primary/40"
                >
                  <div
                    className={`h-1 w-full bg-gradient-to-r ${meta.accent}`}
                    aria-hidden
                  />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-serif text-2xl font-semibold text-gold-gradient">
                            Order #{order.orderNumber}
                          </h2>
                          <Badge variant={meta.badge}>{meta.label}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary/80" />
                            {new Date(order.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-primary/80" />
                            PIN {order.pincode}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="eyebrow !text-[0.58rem] !text-muted-foreground">
                          Total · COD
                        </p>
                        <p className="font-serif text-2xl font-semibold">
                          {formatINR(order.grandTotal)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <ul className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-full border border-primary/15 bg-white/[0.03] px-3 py-1 text-xs"
                        >
                          <strong className="text-primary">{item.quantity}×</strong>{" "}
                          {item.dishName}
                        </li>
                      ))}
                    </ul>

                    {order.status === "CANCELLED" && order.cancellationNote && (
                      <p className="mt-4 rounded-xl border border-ruby-light/40 bg-ruby/15 px-4 py-2.5 text-sm">
                        <strong className="text-ruby-light">
                          Cancellation note:
                        </strong>{" "}
                        {order.cancellationNote}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(order)}
                      >
                        <RotateCcw />
                        1-Click Reorder
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/orders/${order.id}`}>
                          Track live <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
