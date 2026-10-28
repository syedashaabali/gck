"use client";

import React, { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  ChefHat,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Truck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, formatElapsedTime, formatINR } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/order-status";
import type { OrderRecord } from "@/app/orders/[id]/page";

interface KdsOrderCardProps {
  order: OrderRecord;
  onUpdateStatus: (
    orderId: string,
    nextStatus: OrderRecord["status"],
    cancellationNote?: string
  ) => Promise<void>;
  onPrintKot: (order: OrderRecord) => void;
}

export function KdsOrderCard({
  order,
  onUpdateStatus,
  onPrintKot,
}: KdsOrderCardProps) {
  const [busy, setBusy] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationNote, setCancellationNote] = useState("");
  const [addressExpanded, setAddressExpanded] = useState(false);
  const meta = ORDER_STATUS[order.status];

  const handleProgress = async (nextStatus: OrderRecord["status"]) => {
    setBusy(true);
    try {
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onUpdateStatus(
        order.id,
        "CANCELLED",
        cancellationNote.trim() ||
          "Order cancelled by kitchen due to item unavailability."
      );
      setCancelModalOpen(false);
      setCancellationNote("");
    } finally {
      setBusy(false);
    }
  };

  const whatsappVerificationMsg = encodeURIComponent(
    `Salam ${order.customerName}, this is Gulmarg Cloud Kitchen confirming your Cash-on-Delivery Order #${order.orderNumber} for ${formatINR(
      order.grandTotal
    )} to ${order.deliveryAddress} (PIN: ${order.pincode}).`
  );

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <article
        className={cn(
          "kds-card glass flex flex-col justify-between overflow-hidden rounded-2xl border transition",
          meta.card
        )}
      >
        <div className={`h-1 w-full bg-gradient-to-r ${meta.accent}`} aria-hidden />
        <div className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-semibold text-gold-gradient sm:text-2xl">
                  #{order.orderNumber}
                </span>
                <Badge variant={meta.badge}>{meta.label}</Badge>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground sm:mt-1">
                <Clock className="size-3.5 text-primary" />
                {formatElapsedTime(order.createdAt)} ·{" "}
                {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrintKot(order)}
              className="h-8 shrink-0 px-2.5 text-xs sm:h-9 sm:px-3"
            >
              <Printer />
              KOT
            </Button>
          </div>

          {/* Customer */}
          <div className="space-y-2.5 rounded-xl border border-white/5 bg-black/30 p-3 sm:p-3.5">
            <div className="space-y-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {order.customerName}
                </p>
                <p className="whitespace-nowrap font-mono text-xs text-primary">
                  +91 {order.customerPhone}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  title="Call customer"
                  className="h-8 w-full text-xs sm:h-9"
                >
                  <a href={`tel:+91${order.customerPhone}`}>
                    <Phone />
                    Call
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  title="WhatsApp COD verification"
                  className="h-8 w-full border-jade-light/40 text-xs text-jade-light hover:border-jade-light hover:bg-jade/20 hover:text-jade-light sm:h-9"
                >
                  <a
                    href={`https://wa.me/91${order.customerPhone}?text=${whatsappVerificationMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle />
                    Verify
                  </a>
                </Button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddressExpanded((prev) => !prev)}
              className="flex w-full items-start gap-2 border-t border-white/5 pt-2 text-left text-xs text-foreground/85 sm:cursor-default"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    !addressExpanded &&
                      order.status !== "OUT_FOR_DELIVERY" &&
                      "line-clamp-1 sm:line-clamp-none"
                  )}
                >
                  {order.deliveryAddress}
                </p>
                {order.landmark && (
                  <p
                    className={cn(
                      "text-muted-foreground",
                      !addressExpanded &&
                        order.status !== "OUT_FOR_DELIVERY" &&
                        "hidden sm:block"
                    )}
                  >
                    Landmark: {order.landmark}
                  </p>
                )}
                <p className="mt-0.5 font-mono text-[0.7rem] text-primary">
                  PIN {order.pincode}
                </p>
              </div>
            </button>
          </div>

          {/* Chef note */}
          {order.cookingNotes && (
            <div className="rounded-xl border border-primary/50 bg-primary/15 p-3 sm:p-3.5">
              <p className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-gold-light">
                <ChefHat className="size-4" />
                Chef&apos;s note
              </p>
              <p className="mt-1 font-script text-base font-semibold italic leading-snug sm:mt-1.5 sm:text-lg">
                &ldquo;{order.cookingNotes}&rdquo;
              </p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-1.5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {totalQty} {totalQty === 1 ? "item" : "items"}
            </p>
            <ul className="divide-y divide-white/5 rounded-xl border border-white/5 bg-black/20 px-3 sm:px-3.5">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-1.5 text-sm sm:py-2"
                >
                  <span className="min-w-0 truncate font-medium">
                    <span className="mr-1.5 inline-block w-6 font-mono text-primary sm:mr-2 sm:w-7">
                      {item.quantity}×
                    </span>
                    {item.dishName}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatINR(item.itemTotal)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {order.status === "CANCELLED" && order.cancellationNote && (
            <p className="rounded-xl border border-ruby-light/40 bg-ruby/15 p-3 text-xs">
              <strong className="text-ruby-light">Cancelled:</strong>{" "}
              {order.cancellationNote}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3 border-t border-primary/15 bg-black/30 p-3.5 sm:space-y-3.5 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Banknote className="size-4 text-primary" />
              COD to collect
            </span>
            <span className="font-serif text-xl font-semibold text-gold-gradient sm:text-2xl">
              {formatINR(order.grandTotal)}
            </span>
          </div>

          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <div className="flex items-center gap-2">
              {order.status === "RECEIVED" && (
                <Button
                  disabled={busy}
                  onClick={() => handleProgress("PREPARING")}
                  className="flex-1"
                >
                  {busy ? <Loader2 className="animate-spin" /> : <ChefHat />}
                  Accept & prepare
                </Button>
              )}
              {order.status === "PREPARING" && (
                <Button
                  variant="sapphire"
                  disabled={busy}
                  onClick={() => handleProgress("OUT_FOR_DELIVERY")}
                  className="flex-1"
                >
                  {busy ? <Loader2 className="animate-spin" /> : <Truck />}
                  Dispatch order
                </Button>
              )}
              {order.status === "OUT_FOR_DELIVERY" && (
                <Button
                  variant="jade"
                  disabled={busy}
                  onClick={() => handleProgress("DELIVERED")}
                  className="flex-1"
                >
                  {busy ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <CheckCircle2 />
                  )}
                  Delivered · COD paid
                </Button>
              )}
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => setCancelModalOpen(true)}
                title="Cancel order"
                aria-label="Cancel order"
                className="shrink-0 border-ruby-light/40 px-3 text-ruby-light hover:border-ruby-light hover:bg-ruby/20 hover:text-ruby-light"
              >
                <XCircle />
                <span className="kds-cancel-label">Cancel</span>
              </Button>
            </div>
          )}
        </div>
      </article>

      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel order #{order.orderNumber}</DialogTitle>
            <DialogDescription>
              This note appears live on {order.customerName}&apos;s order
              tracking screen.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`cancel-note-${order.id}`}>
                Cancellation reason *
              </Label>
              <Textarea
                id={`cancel-note-${order.id}`}
                required
                rows={3}
                placeholder="e.g. Customer unreachable for COD verification / dish sold out."
                value={cancellationNote}
                onChange={(e) => setCancellationNote(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelModalOpen(false)}
              >
                Keep order
              </Button>
              <Button type="submit" variant="destructive" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : "Confirm cancellation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
