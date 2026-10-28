"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  ChefHat,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrandEmblem } from "@/components/brand/Brand";
import { BillRow } from "./BillRow";
import { cn, formatINR, isPincodeServiceable } from "@/lib/utils";
import { useCartStore, type DishRecord } from "@/store/useCartStore";
import type { AddressItem, AuthenticatedUser } from "./LuxuryHeader";

export interface StoreSettingsRecord {
  id: string;
  storeName: string;
  isAcceptingOrders: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  taxPercentage: number;
  whatsappNumber: string;
  fssaiNumber: string;
  serviceablePincodes: string;
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dishes: DishRecord[];
  settings: StoreSettingsRecord;
  user: AuthenticatedUser | null;
  activeAddress: AddressItem | null;
  onRequireAuth: () => void;
  onOpenAddressBook: () => void;
}

export function CartSheet({
  open,
  onOpenChange,
  dishes,
  settings,
  user,
  activeAddress,
  onRequireAuth,
  onOpenAddressBook,
}: CartSheetProps) {
  const router = useRouter();
  const {
    items,
    cookingNotes,
    updateQuantity,
    removeItem,
    setCookingNotes,
    clearCart,
    reconcileWithDishes,
  } = useCartStore();

  const [placingOrder, setPlacingOrder] = useState(false);

  // Live Cart Sync & Stale Item Reconciliation whenever sheet opens or dishes refresh
  useEffect(() => {
    if (dishes.length > 0) {
      reconcileWithDishes(dishes);
    }
  }, [open, dishes, reconcileWithDishes]);

  // Explicit Bill Breakdown
  const subtotal =
    Math.round(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100;

  const packagingTotal =
    Math.round(
      items.reduce(
        (sum, item) => sum + item.packagingCharge * item.quantity,
        0
      ) * 100
    ) / 100;

  const taxAmount =
    Math.round(
      (subtotal + packagingTotal) * (settings.taxPercentage / 100) * 100
    ) / 100;

  const deliveryFee =
    subtotal === 0
      ? 0
      : subtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryFee;

  const grandTotal =
    Math.round((subtotal + packagingTotal + taxAmount + deliveryFee) * 100) /
    100;

  // Guardrails
  const outOfStockItems = items.filter((i) => !i.isAvailable);
  const hasOutOfStock = outOfStockItems.length > 0;
  const belowMinOrder = subtotal > 0 && subtotal < settings.minOrderAmount;
  const amountNeededForMinOrder = Math.max(
    0,
    Math.ceil(settings.minOrderAmount - subtotal)
  );
  const amountNeededForFreeDelivery = Math.max(
    0,
    Math.ceil(settings.freeDeliveryThreshold - subtotal)
  );
  const freeDeliveryProgress = Math.min(
    100,
    settings.freeDeliveryThreshold > 0
      ? Math.round((subtotal / settings.freeDeliveryThreshold) * 100)
      : 100
  );

  const pincodeServiceable = activeAddress
    ? isPincodeServiceable(activeAddress.pincode, settings.serviceablePincodes)
    : true;

  const canPlaceOrder =
    items.length > 0 &&
    settings.isAcceptingOrders &&
    !hasOutOfStock &&
    !belowMinOrder &&
    (!user || (user.isOnboarded && Boolean(activeAddress) && pincodeServiceable));

  const handlePlaceOrder = async () => {
    if (!user) {
      onOpenChange(false);
      onRequireAuth();
      return;
    }

    if (!activeAddress) {
      onOpenChange(false);
      onOpenAddressBook();
      return;
    }

    if (!canPlaceOrder) return;

    setPlacingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: activeAddress.id,
          deliveryAddress: activeAddress.fullAddress,
          landmark: activeAddress.landmark,
          pincode: activeAddress.pincode,
          cookingNotes: cookingNotes.trim() || null,
          items: items.map((i) => ({
            dishId: i.dishId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Unable to place order.");
        if (dishes.length > 0) {
          reconcileWithDishes(dishes);
        }
        return;
      }

      clearCart();
      onOpenChange(false);
      toast.success(`Order #${data.order.orderNumber} confirmed`);
      router.push(`/orders/${data.order.id}`);
    } catch {
      toast.error("Network error while placing your order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="space-y-1 border-b border-primary/15 px-4 pb-4 pt-5 text-left sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3 pr-8">
            <BrandEmblem className="size-9" />
            <div>
              <SheetTitle className="font-serif text-2xl">Your Order</SheetTitle>
              <SheetDescription className="text-xs">
                Prepared fresh · Cash or UPI on delivery
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-5 flex size-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <ShoppingBag className="size-9" />
            </div>
            <h3 className="font-serif text-2xl font-semibold">
              Your cart is empty
            </h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Explore our Wazwan signatures, slow-cooked biryanis and
              artisanal kebabs to begin your feast.
            </p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-6"
            >
              Browse the menu
            </Button>
          </div>
        ) : (
          <>
            <div className="luxury-scroller flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
              {/* Free delivery progress */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <Truck className="size-4 text-primary" />
                    {amountNeededForFreeDelivery === 0 ? (
                      <span className="font-semibold text-jade-light">
                        Complimentary delivery unlocked
                      </span>
                    ) : (
                      <span>
                        Add{" "}
                        <strong className="text-gold-light">
                          {formatINR(amountNeededForFreeDelivery)}
                        </strong>{" "}
                        for free delivery
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {freeDeliveryProgress}%
                  </span>
                </div>
                <Progress
                  value={freeDeliveryProgress}
                  className="mt-3"
                  indicatorClassName={
                    amountNeededForFreeDelivery === 0
                      ? "from-jade via-jade-light to-jade-light"
                      : undefined
                  }
                />
              </div>

              {hasOutOfStock && (
                <Alert className="border-ruby-light/40 bg-ruby/15">
                  <AlertTriangle className="size-4 !text-ruby-light" />
                  <AlertTitle className="font-serif">
                    Live kitchen stock update
                  </AlertTitle>
                  <AlertDescription className="text-foreground/75">
                    A dish in your cart just sold out. Remove the highlighted
                    item to continue to checkout.
                  </AlertDescription>
                </Alert>
              )}

              {/* Delivery address */}
              {user && (
                <div className="glass flex items-center justify-between gap-3 rounded-xl p-3.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        {activeAddress?.label || "No address selected"}
                        {activeAddress?.pincode && (
                          <span className="ml-2 font-mono normal-case tracking-normal text-muted-foreground">
                            {activeAddress.pincode}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-foreground/85">
                        {activeAddress?.fullAddress ||
                          "Please select a delivery address"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onOpenAddressBook();
                    }}
                    className="shrink-0"
                  >
                    Change
                  </Button>
                </div>
              )}

              {user && activeAddress && !pincodeServiceable && (
                <Alert className="border-ruby-light/40 bg-ruby/15">
                  <ShieldAlert className="size-4 !text-ruby-light" />
                  <AlertTitle className="font-serif">
                    We don&apos;t deliver to {activeAddress.pincode} yet
                  </AlertTitle>
                  <AlertDescription className="text-foreground/75">
                    Serviceable pincodes:{" "}
                    <span className="font-mono text-gold-light">
                      {settings.serviceablePincodes}
                    </span>
                    . Please switch your delivery address.
                  </AlertDescription>
                </Alert>
              )}

              {/* Items */}
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.dishId}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 transition",
                      item.isAvailable
                        ? "border-primary/15 bg-white/[0.02]"
                        : "border-ruby-light/50 bg-ruby/10"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-16 shrink-0 rounded-lg object-cover ring-1 ring-primary/25 sm:size-[4.25rem]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            item.dietaryType === "VEG"
                              ? "bg-jade-light"
                              : "bg-ruby-light"
                          )}
                        />
                        <h4 className="line-clamp-2 font-serif text-base font-semibold leading-snug">
                          {item.name}
                        </h4>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatINR(item.price)} · +{formatINR(item.packagingCharge)}{" "}
                        packaging
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        {!item.isAvailable ? (
                          <Badge variant="destructive">
                            Out of stock
                          </Badge>
                        ) : (
                          <p className="font-serif text-base font-semibold text-gold-gradient">
                            {formatINR(item.price * item.quantity)}
                          </p>
                        )}

                        {item.isAvailable ? (
                          <div className="inline-flex shrink-0 items-center rounded-full border border-primary/50 bg-black/40 p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.dishId, item.quantity - 1)
                              }
                              aria-label={`Decrease ${item.name}`}
                              className="flex size-8 items-center justify-center rounded-full text-gold-light hover:bg-primary/20"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-6 text-center text-sm font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.dishId, item.quantity + 1)
                              }
                              aria-label={`Increase ${item.name}`}
                              className="flex size-8 items-center justify-center rounded-full text-gold-light hover:bg-primary/20"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeItem(item.dishId)}
                            className="h-8 shrink-0 px-3"
                          >
                            <Trash2 /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Chef's note */}
              <div className="space-y-2">
                <Label htmlFor="cooking-notes" className="flex items-center gap-2">
                  <ChefHat className="size-3.5 text-primary" />
                  Note for the chef
                </Label>
                <Textarea
                  id="cooking-notes"
                  rows={2}
                  placeholder="Less spicy, extra onions, serve gravy warm…"
                  value={cookingNotes}
                  onChange={(e) => setCookingNotes(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Bill */}
              <div className="glass space-y-2.5 rounded-xl p-4">
                <p className="eyebrow !text-[0.62rem]">Bill summary</p>
                <BillRow label="Item subtotal" value={formatINR(subtotal)} />
                <BillRow label="Packaging" value={formatINR(packagingTotal)} />
                <BillRow
                  label={`GST (${settings.taxPercentage}%)`}
                  value={formatINR(taxAmount)}
                />
                <BillRow
                  label="Delivery"
                  value={
                    deliveryFee === 0 ? (
                      <span className="font-semibold text-jade-light">FREE</span>
                    ) : (
                      formatINR(deliveryFee)
                    )
                  }
                />
                <div className="my-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <BillRow
                  strong
                  label="Grand total"
                  value={formatINR(grandTotal)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm">
                <span className="flex items-center gap-2.5 font-medium">
                  <Banknote className="size-4 shrink-0 text-primary" />
                  Cash on Delivery · Cash or UPI at your door
                </span>
                <Badge>COD</Badge>
              </div>
            </div>

            {/* Checkout footer */}
            <div className="space-y-3 border-t border-primary/20 bg-black/40 p-4 backdrop-blur sm:p-5">
              {belowMinOrder && (
                <p className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-gold-light">
                  Add {formatINR(amountNeededForMinOrder)} more to meet the{" "}
                  {formatINR(settings.minOrderAmount)} minimum order.
                </p>
              )}

              {!settings.isAcceptingOrders && (
                <p className="rounded-lg border border-ruby-light/40 bg-ruby/15 px-3 py-2 text-center text-xs font-medium text-ruby-light">
                  The kitchen is currently offline and not accepting orders.
                </p>
              )}

              {!user ? (
                <Button
                  size="lg"
                  onClick={() => {
                    onOpenChange(false);
                    onRequireAuth();
                  }}
                  className="w-full"
                >
                  Sign in with OTP to order
                  <ArrowRight />
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={!canPlaceOrder || placingOrder}
                  onClick={handlePlaceOrder}
                  className="w-full justify-between px-6"
                >
                  <span>{placingOrder ? "Confirming…" : "Place order · COD"}</span>
                  <span className="flex items-center gap-2">
                    {formatINR(grandTotal)}
                    {placingOrder ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <ArrowRight />
                    )}
                  </span>
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
