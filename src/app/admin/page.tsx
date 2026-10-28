"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Bell,
  BellOff,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  MoreVertical,
  Settings,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandEmblem, BrandMark } from "@/components/brand/Brand";
import { AdminKpiBar, type AdminKpis } from "@/components/admin/AdminKpiBar";
import { KdsOrderCard } from "@/components/admin/KdsOrderCard";
import { KotPrintModal } from "@/components/admin/KotPrintModal";
import { StoreSettingsModal } from "@/components/admin/StoreSettingsModal";
import {
  MenuManagerTab,
  type CategoryAdminRecord,
} from "@/components/admin/MenuManagerTab";
import { playRoyalKitchenChime } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/order-status";
import type { OrderRecord } from "@/app/orders/[id]/page";
import type { StoreSettingsRecord } from "@/components/storefront/CartSheet";
import type { DishRecord } from "@/store/useCartStore";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_SETTINGS: StoreSettingsRecord = {
  id: "default",
  storeName: "Gulmarg Cloud Kitchen",
  isAcceptingOrders: true,
  deliveryFee: 40,
  freeDeliveryThreshold: 499,
  minOrderAmount: 149,
  taxPercentage: 5,
  whatsappNumber: "+919876543210",
  fssaiNumber: "22726199000490",
  serviceablePincodes: "ALL",
};

const DEFAULT_KPIS: AdminKpis = {
  todayTotalOrders: 0,
  activeKitchenLoad: 0,
  pendingCodCash: 0,
  todayDeliveredRevenue: 0,
};

type BoardFilter = "ALL_BOARD" | "RECEIVED" | "PREPARING" | "OUT_FOR_DELIVERY" | "HISTORY";

/**
 * Horizontal left-right swipeable scroll-snap list across mobile and desktop.
 * Uses native `scrollsnapchange` with an `IntersectionObserver` fallback
 * (Modern Web Guidance: scroll-snap-state-sync).
 */
function SwipeableOrderTrack({
  orders,
  renderCard,
  desktopMode = "grid",
}: {
  orders: OrderRecord[];
  renderCard: (order: OrderRecord) => React.ReactNode;
  desktopMode?: "grid" | "stack";
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((prev) =>
      orders.length === 0 ? 0 : Math.min(prev, orders.length - 1)
    );
  }, [orders.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || orders.length <= 1) return;

    const slides = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-order-slide]")
    );

    // Feature detect support for Scroll Snap Events (Modern Web Guidance: scroll-snap-state-sync)
    if ("onscrollsnapchange" in HTMLElement.prototype) {
      const handleSnapChange = (e: Event) => {
        const snapEvent = e as Event & { snapTargetInline?: Element | null };
        const target = snapEvent.snapTargetInline as HTMLElement | null;
        if (target?.dataset.orderSlide !== undefined) {
          setActiveIndex(Number(target.dataset.orderSlide));
        }
      };
      scroller.addEventListener("scrollsnapchange", handleSnapChange);
      return () =>
        scroller.removeEventListener("scrollsnapchange", handleSnapChange);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.orderSlide
            );
            if (!Number.isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        }
      },
      { root: scroller, threshold: 0.65 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [orders]);

  const scrollToSlide = (idx: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = scroller.querySelector<HTMLElement>(
      `[data-order-slide="${idx}"]`
    );
    target?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    setActiveIndex(idx);
  };

  return (
    <div className="space-y-2.5">
      {orders.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[0.7rem] text-muted-foreground">
            Order {activeIndex + 1} of {orders.length} · Swipe left/right
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              aria-label="Previous order card"
              className="flex size-6 items-center justify-center rounded-full border border-primary/25 bg-card/80 text-foreground transition hover:border-primary/60 disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <nav
              aria-label="Order cards pagination"
              className="flex items-center gap-1"
            >
              {orders.map((o, idx) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => scrollToSlide(idx)}
                  aria-label={`Go to order #${o.orderNumber}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === activeIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-primary/30"
                  )}
                />
              ))}
            </nav>
            <button
              type="button"
              onClick={() =>
                scrollToSlide(Math.min(orders.length - 1, activeIndex + 1))
              }
              disabled={activeIndex === orders.length - 1}
              aria-label="Next order card"
              className="flex size-6 items-center justify-center rounded-full border border-primary/25 bg-card/80 text-foreground transition hover:border-primary/60 disabled:opacity-30"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollerRef}
        className="luxury-scroller -mx-3 flex snap-x snap-mandatory items-stretch gap-3.5 overflow-x-auto overscroll-x-contain px-3 pb-2.5 sm:mx-0 sm:gap-5 sm:px-0"
      >
        {orders.map((order, idx) => (
          <div
            key={order.id}
            data-order-slide={idx}
            className={cn(
              "snap-center shrink-0 sm:snap-start",
              orders.length > 1
                ? desktopMode === "grid"
                  ? "w-[88%] max-w-[360px] sm:w-[360px] sm:max-w-[380px]"
                  : "w-[88%] max-w-[360px] lg:w-full lg:max-w-none"
                : desktopMode === "grid"
                  ? "w-full sm:w-[360px] sm:max-w-[380px]"
                  : "w-full"
            )}
          >
            {renderCard(order)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminKdsPortalPage() {
  // Check Admin Authentication Status
  const {
    data: authData,
    isLoading: authChecking,
    mutate: mutateAdminAuth,
  } = useSWR<{ authenticated: boolean }>("/api/admin/auth", fetcher);

  const isAuthenticated = Boolean(authData?.authenticated);

  // Passcode form state
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Poll orders & KPIs every 4 seconds when authenticated
  const { data: ordersData, mutate: mutateOrders } = useSWR<{
    orders: OrderRecord[];
    kpis: AdminKpis;
  }>(isAuthenticated ? "/api/orders?scope=admin" : null, fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });

  // Poll categories, dishes & store settings every 4 seconds
  const { data: catalogData, mutate: mutateCatalog } = useSWR<{
    settings: StoreSettingsRecord;
    categories: CategoryAdminRecord[];
    dishes: DishRecord[];
  }>(isAuthenticated ? "/api/dishes?all=true" : null, fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });

  const [audioBellEnabled, setAudioBellEnabled] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [kotOrder, setKotOrder] = useState<OrderRecord | null>(null);
  const [kdsFilter, setKdsFilter] = useState<BoardFilter>("ALL_BOARD");

  const orders = useMemo(() => ordersData?.orders || [], [ordersData?.orders]);
  const kpis = ordersData?.kpis || DEFAULT_KPIS;
  const settings = catalogData?.settings || DEFAULT_SETTINGS;
  const categories = catalogData?.categories || [];
  const dishes = catalogData?.dishes || [];

  // Track seen RECEIVED order IDs to trigger Web Audio KDS Chime on newly arrived orders
  const seenReceivedIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !ordersData?.orders) return;

    const currentReceivedIds = new Set(
      ordersData.orders.filter((o) => o.status === "RECEIVED").map((o) => o.id)
    );

    if (seenReceivedIdsRef.current === null) {
      seenReceivedIdsRef.current = currentReceivedIds;
      return;
    }

    let hasNewOrder = false;
    for (const id of currentReceivedIds) {
      if (!seenReceivedIdsRef.current.has(id)) {
        hasNewOrder = true;
        break;
      }
    }

    seenReceivedIdsRef.current = currentReceivedIds;

    if (hasNewOrder) {
      toast.info("New order received in the kitchen", {
        description: "Check the Received column on the KDS board.",
      });
      if (audioBellEnabled) {
        playRoyalKitchenChime();
      }
    }
  }, [ordersData?.orders, isAuthenticated, audioBellEnabled]);

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid Admin Passcode.");
        return;
      }
      toast.success("Welcome to the Kitchen Console");
      setPasscode("");
      mutateAdminAuth({ authenticated: true }, false);
    } catch {
      toast.error("Failed to verify passcode.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    mutateAdminAuth({ authenticated: false }, false);
    toast.success("Kitchen console locked.");
  };

  const handleToggleKitchenOnline = async (checked: boolean) => {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAcceptingOrders: checked }),
    });
    if (res.ok) {
      toast.success(
        checked
          ? "Kitchen is ONLINE and accepting orders."
          : "Kitchen is OFFLINE. Customer checkout disabled."
      );
      mutateCatalog();
    } else {
      toast.error("Failed to toggle kitchen status.");
    }
  };

  const handleSeedRoyalMenu = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to seed menu.");
        return;
      }
      toast.success(data.message || "Royal Gulmarg Menu seeded!");
      mutateCatalog();
    } catch {
      toast.error("Error seeding menu.");
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    nextStatus: OrderRecord["status"],
    cancellationNote?: string
  ) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        ...(cancellationNote ? { cancellationNote } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to update order status.");
      return;
    }
    toast.success(
      `Order #${data.order.orderNumber} moved to ${nextStatus
        .replace(/_/g, " ")
        .toLowerCase()}`
    );
    mutateOrders();
  };

  const columns: {
    key: Exclude<BoardFilter, "ALL_BOARD">;
    title: string;
    status: OrderStatusKey;
    list: OrderRecord[];
  }[] = [
    {
      key: "RECEIVED",
      title: "Received",
      status: "RECEIVED",
      list: orders.filter((o) => o.status === "RECEIVED"),
    },
    {
      key: "PREPARING",
      title: "Preparing",
      status: "PREPARING",
      list: orders.filter((o) => o.status === "PREPARING"),
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for delivery",
      status: "OUT_FOR_DELIVERY",
      list: orders.filter((o) => o.status === "OUT_FOR_DELIVERY"),
    },
    {
      key: "HISTORY",
      title: "Delivered / Cancelled",
      status: "DELIVERED",
      list: orders.filter(
        (o) => o.status === "DELIVERED" || o.status === "CANCELLED"
      ),
    },
  ];

  const renderCard = (order: OrderRecord) => (
    <KdsOrderCard
      key={order.id}
      order={order}
      onUpdateStatus={handleUpdateOrderStatus}
      onPrintKot={setKotOrder}
    />
  );

  // Passcode gate
  if (!authChecking && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-strong relative w-full max-w-md space-y-7 rounded-3xl p-8 shadow-2xl shadow-black/60">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
          />
          <div className="flex flex-col items-center space-y-3 text-center">
            <BrandEmblem className="size-16" />
            <div>
              <p className="eyebrow">Restricted access</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold">
                Kitchen Console
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the master passcode to access live orders, KOT printing and
              inventory controls.
            </p>
          </div>

          {/* Modern Web Guidance: autofill-sign-in-form */}
          <form onSubmit={handlePasscodeLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Admin passcode</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  name="password"
                  type={showPasscode ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  enterKeyHint="done"
                  required
                  placeholder="••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="h-12 pr-11 text-center font-mono text-lg tracking-[0.5em]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
                >
                  {showPasscode ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Local default from <code>.env</code>:{" "}
                <button
                  type="button"
                  onClick={() => setPasscode("123456")}
                  className="font-mono font-semibold text-primary underline underline-offset-4"
                >
                  123456 (tap to fill)
                </button>
              </p>
            </div>

            <Button type="submit" size="lg" disabled={authLoading} className="w-full">
              {authLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Unlocking…
                </>
              ) : (
                <>
                  <Lock /> Unlock console
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs">
            <Link
              href="/"
              className="text-muted-foreground underline-offset-4 transition hover:text-gold-light hover:underline"
            >
              ← Back to the storefront
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const activeOrderCount =
    columns[0].list.length + columns[1].list.length + columns[2].list.length;

  const filterOptions: { value: BoardFilter; label: string; count?: number }[] = [
    { value: "ALL_BOARD", label: "Active board", count: activeOrderCount },
    { value: "RECEIVED", label: "Received", count: columns[0].list.length },
    { value: "PREPARING", label: "Preparing", count: columns[1].list.length },
    { value: "OUT_FOR_DELIVERY", label: "On the way", count: columns[2].list.length },
    { value: "HISTORY", label: "History", count: columns[3].list.length },
  ];

  const handleToggleBell = () => {
    const next = !audioBellEnabled;
    setAudioBellEnabled(next);
    if (next) {
      playRoyalKitchenChime();
      toast.success("KDS bell unmuted (chime tested)");
    } else {
      toast.info("KDS bell muted");
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:flex-wrap sm:gap-x-6 sm:gap-y-3 sm:px-6 sm:py-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <BrandMark compact />
              <span className="hidden h-8 w-px bg-primary/25 sm:block" />
              <div className="hidden sm:block">
                <p className="eyebrow !text-[0.58rem]">Kitchen console</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 animate-pulse-ring rounded-full bg-jade-light" />
                  Live · syncing every 4s
                </p>
              </div>
            </div>

            {/* Mobile single-row compact controls */}
            <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
              <div className="glass flex items-center gap-1.5 rounded-xl px-2 py-1">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    settings.isAcceptingOrders
                      ? "animate-pulse-ring bg-jade-light"
                      : "bg-ruby-light"
                  )}
                />
                <span className="text-[0.68rem] font-semibold">
                  {settings.isAcceptingOrders ? "Online" : "Offline"}
                </span>
                <Switch
                  checked={settings.isAcceptingOrders}
                  onCheckedChange={handleToggleKitchenOnline}
                  aria-label="Toggle kitchen online"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "size-8 shrink-0",
                  !audioBellEnabled && "text-muted-foreground"
                )}
                onClick={handleToggleBell}
                aria-label={audioBellEnabled ? "Mute KDS bell" : "Unmute KDS bell"}
              >
                {audioBellEnabled ? (
                  <Bell className="size-4 text-primary" />
                ) : (
                  <BellOff className="size-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="More kitchen console actions"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl border-primary/25 bg-popover/95 p-1.5 backdrop-blur-xl"
                >
                  <DropdownMenuItem onSelect={() => setSettingsModalOpen(true)}>
                    <Settings className="text-primary" />
                    Store settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={seeding}
                    onSelect={() => handleSeedRoyalMenu()}
                  >
                    {seeding ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Sparkles className="text-primary" />
                    )}
                    Seed royal menu
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <ExternalLink />
                      Open storefront
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleAdminLogout}
                    className="text-ruby-light focus:text-ruby-light"
                  >
                    <LogOut />
                    Lock console
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop / tablet full controls */}
            <div className="hidden flex-wrap items-center justify-end gap-2 sm:flex">
              <div className="glass flex items-center gap-2.5 rounded-xl px-3 py-1.5">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    settings.isAcceptingOrders
                      ? "animate-pulse-ring bg-jade-light"
                      : "bg-ruby-light"
                  )}
                />
                <span className="text-xs font-semibold">
                  {settings.isAcceptingOrders ? "Kitchen online" : "Kitchen offline"}
                </span>
                <Switch
                  checked={settings.isAcceptingOrders}
                  onCheckedChange={handleToggleKitchenOnline}
                  aria-label="Toggle kitchen online"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 px-3",
                    !audioBellEnabled && "text-muted-foreground"
                  )}
                  onClick={handleToggleBell}
                >
                  {audioBellEnabled ? (
                    <Bell className="text-primary" />
                  ) : (
                    <BellOff />
                  )}
                  <span className="text-xs max-md:sr-only">
                    {audioBellEnabled ? "Bell on" : "Bell muted"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  disabled={seeding}
                  onClick={handleSeedRoyalMenu}
                >
                  {seeding ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles className="text-primary" />
                  )}
                  <span className="text-xs max-md:sr-only">Seed menu</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => setSettingsModalOpen(true)}
                >
                  <Settings className="text-primary" />
                  <span className="text-xs max-md:sr-only">Settings</span>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="h-9 px-3"
                >
                  <Link href="/">
                    <ExternalLink />
                    <span className="text-xs max-md:sr-only">Storefront</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAdminLogout}
                  title="Lock console"
                  aria-label="Lock console"
                  className="size-9 shrink-0 text-muted-foreground hover:text-ruby-light"
                >
                  <LogOut />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 px-3 py-3 sm:space-y-8 sm:px-6 sm:py-8">
        <AdminKpiBar kpis={kpis} />

        <Tabs defaultValue="kds" className="space-y-4 sm:space-y-6">
          <TabsList className="grid h-10 w-full grid-cols-2 sm:inline-flex sm:h-12 sm:w-auto">
            <TabsTrigger
              value="kds"
              className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
            >
              <ChefHat className="size-4 shrink-0 max-[380px]:hidden" />
              <span className="truncate">Live orders</span>
              <Badge variant="secondary" className="ml-0.5 px-1.5 py-0">
                {activeOrderCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="gap-1.5 px-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
            >
              <UtensilsCrossed className="size-4 shrink-0 max-[380px]:hidden" />
              <span className="truncate">Menu & inventory</span>
              <Badge variant="secondary" className="ml-0.5 px-1.5 py-0">
                {dishes.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kds" className="space-y-4 sm:space-y-5">
            <ToggleGroup
              type="single"
              value={kdsFilter}
              onValueChange={(v) => v && setKdsFilter(v as BoardFilter)}
              aria-label="Board filter"
              className="no-scrollbar flex-nowrap justify-start gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0"
            >
              {filterOptions.map((opt) => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  variant="outline"
                  className="h-8 shrink-0 rounded-full border border-primary/20 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
                >
                  {opt.label}
                  <span className="font-mono text-[0.7rem] opacity-70">
                    {opt.count}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {orders.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center sm:p-14">
                <ChefHat className="mx-auto size-10 text-primary" />
                <h3 className="mt-4 font-serif text-2xl font-semibold">
                  The pass is clear
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  New orders appear here within 4 seconds of being placed — and
                  announce themselves with the kitchen chime.
                </p>
              </div>
            ) : kdsFilter === "ALL_BOARD" ? (
              <div className="space-y-4">
                {activeOrderCount === 0 && (
                  <div className="glass rounded-2xl p-8 text-center lg:hidden">
                    <ChefHat className="mx-auto size-8 text-primary" />
                    <h3 className="mt-3 font-serif text-xl font-semibold">
                      No active kitchen orders
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      All received and preparing orders have been settled.
                    </p>
                    {columns[3].list.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setKdsFilter("HISTORY")}
                      >
                        View {columns[3].list.length} settled / cancelled orders
                      </Button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4">
                  {columns.map((col) => {
                    const meta = ORDER_STATUS[col.status];
                    const hideOnMobile =
                      col.list.length === 0 || col.key === "HISTORY";
                    return (
                      <section
                        key={col.key}
                        className={cn(
                          "space-y-3 sm:space-y-4",
                          hideOnMobile && "hidden lg:block"
                        )}
                      >
                        <div className="glass overflow-hidden rounded-xl">
                          <div
                            className={`h-0.5 w-full bg-gradient-to-r ${meta.accent}`}
                            aria-hidden
                          />
                          <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3">
                            <h3
                              className={cn(
                                "font-serif text-sm font-semibold sm:text-base",
                                meta.text
                              )}
                            >
                              {col.title}
                            </h3>
                            <Badge variant={meta.badge}>{col.list.length}</Badge>
                          </div>
                        </div>
                        {col.list.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-primary/15 py-8 text-center text-xs text-muted-foreground">
                            No orders
                          </p>
                        ) : (
                          <SwipeableOrderTrack
                            orders={col.list}
                            renderCard={renderCard}
                            desktopMode="stack"
                          />
                        )}
                      </section>
                    );
                  })}
                </div>

                {activeOrderCount > 0 && columns[3].list.length > 0 && (
                  <div className="text-center lg:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setKdsFilter("HISTORY")}
                      className="text-xs text-muted-foreground hover:text-gold-light"
                    >
                      View {columns[3].list.length} settled / cancelled orders in
                      History →
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              (() => {
                const filteredList =
                  columns.find((c) => c.key === kdsFilter)?.list || [];
                if (filteredList.length === 0) {
                  return (
                    <p className="rounded-xl border border-dashed border-primary/15 py-10 text-center text-xs text-muted-foreground">
                      No orders in this stage
                    </p>
                  );
                }
                return (
                  <SwipeableOrderTrack
                    orders={filteredList}
                    renderCard={renderCard}
                    desktopMode="grid"
                  />
                );
              })()
            )}
          </TabsContent>

          <TabsContent value="menu">
            <MenuManagerTab
              categories={categories}
              dishes={dishes}
              onRefresh={() => mutateCatalog()}
            />
          </TabsContent>
        </Tabs>
      </main>

      <StoreSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        settings={settings}
        onSaved={() => mutateCatalog()}
      />

      <KotPrintModal
        order={kotOrder}
        settings={settings}
        open={Boolean(kotOrder)}
        onOpenChange={(open) => {
          if (!open) setKotOrder(null);
        }}
      />
    </div>
  );
}
