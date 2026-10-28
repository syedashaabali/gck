"use client";

import React from "react";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { OrderRecord } from "@/app/orders/[id]/page";
import type { StoreSettingsRecord } from "@/components/storefront/CartSheet";

interface KotPrintModalProps {
  order: OrderRecord | null;
  settings: StoreSettingsRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KotPrintModal({
  order,
  settings,
  open,
  onOpenChange,
}: KotPrintModalProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="no-print">
          <DialogTitle>80mm Thermal KOT & Customer Bill</DialogTitle>
          <DialogDescription>
            Formatted for standard 80mm POS thermal receipt printers.
          </DialogDescription>
        </DialogHeader>

        {/* Printable 80mm Receipt Area */}
        <div
          id="thermal-kot-print-area"
          className="mx-auto w-full max-w-[302px] rounded-lg border border-black/20 bg-white p-4 font-mono text-xs text-black shadow-inner"
        >
          <div className="text-center border-b border-dashed border-black pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              {settings.storeName}
            </h2>
            <p className="text-[10px]">5-Star Kashmiri Wazwan Cloud Kitchen</p>
            <p className="text-[10px]">FSSAI Lic: {settings.fssaiNumber}</p>
            <p className="text-[10px]">Helpline: {settings.whatsappNumber}</p>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[11px]">
            <div className="flex justify-between font-bold">
              <span>KOT / ORDER #{order.orderNumber}</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div>
              <span>Guest: </span>
              <strong>{order.customerName}</strong>
            </div>
            <div>
              <span>Phone: </span>
              <strong>+91 {order.customerPhone}</strong>
            </div>
            <div>
              <span>Address: </span>
              <span>
                {order.deliveryAddress}
                {order.landmark ? ` (Near ${order.landmark})` : ""} - PIN{" "}
                {order.pincode}
              </span>
            </div>
          </div>

          {order.cookingNotes && (
            <div className="py-1.5 border-b border-dashed border-black bg-black/5 px-1.5 my-1 text-[11px]">
              <strong>CHEF NOTE:</strong> {order.cookingNotes}
            </div>
          )}

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-black">
            <div className="flex justify-between font-bold text-[10px] border-b border-black pb-1 mb-1">
              <span>QTY × ITEM</span>
              <span>AMOUNT</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.quantity} × {item.dishName}
                  </span>
                  <span className="shrink-0">{formatINR(item.itemTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging Charges:</span>
              <span>{formatINR(order.packagingTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({settings.taxPercentage}%):</span>
              <span>{formatINR(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>
                {order.deliveryFee === 0
                  ? "FREE"
                  : formatINR(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
              <span>COLLECT COD:</span>
              <span>{formatINR(order.grandTotal)}</span>
            </div>
          </div>

          <div className="pt-2 text-center text-[10px]">
            <p className="font-bold">*** THANK YOU FOR YOUR ROYAL ORDER ***</p>
            <p>Pay via Cash or UPI at Doorstep</p>
          </div>
        </div>

        <div className="no-print flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()} className="gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Print 80mm KOT / Bill</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
