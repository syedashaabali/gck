"use client";

import React, { useState, useEffect } from "react";
import { Settings, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreSettingsRecord } from "@/components/storefront/CartSheet";

interface StoreSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: StoreSettingsRecord;
  onSaved: (updated: StoreSettingsRecord) => void;
}

export function StoreSettingsModal({
  open,
  onOpenChange,
  settings,
  onSaved,
}: StoreSettingsModalProps) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [deliveryFee, setDeliveryFee] = useState(String(settings.deliveryFee));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(settings.freeDeliveryThreshold)
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    String(settings.minOrderAmount)
  );
  const [taxPercentage, setTaxPercentage] = useState(
    String(settings.taxPercentage)
  );
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [fssaiNumber, setFssaiNumber] = useState(settings.fssaiNumber);
  const [serviceablePincodes, setServiceablePincodes] = useState(
    settings.serviceablePincodes
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStoreName(settings.storeName);
      setDeliveryFee(String(settings.deliveryFee));
      setFreeDeliveryThreshold(String(settings.freeDeliveryThreshold));
      setMinOrderAmount(String(settings.minOrderAmount));
      setTaxPercentage(String(settings.taxPercentage));
      setWhatsappNumber(settings.whatsappNumber);
      setFssaiNumber(settings.fssaiNumber);
      setServiceablePincodes(settings.serviceablePincodes);
    }
  }, [open, settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim() || "Gulmarg Cloud Kitchen",
          deliveryFee: Number(deliveryFee),
          freeDeliveryThreshold: Number(freeDeliveryThreshold),
          minOrderAmount: Number(minOrderAmount),
          taxPercentage: Number(taxPercentage),
          whatsappNumber: whatsappNumber.trim(),
          fssaiNumber: fssaiNumber.trim(),
          serviceablePincodes: serviceablePincodes.trim() || "ALL",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save store settings.");
        return;
      }
      toast.success("Store settings saved to PostgreSQL!");
      onSaved(data.settings);
      onOpenChange(false);
    } catch {
      toast.error("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Store & Delivery Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Changes are persisted in PostgreSQL and synced across all customer
            sessions within 4 seconds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-store-name">Store Name</Label>
            <Input
              id="settings-store-name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="settings-delivery-fee">Delivery Fee (₹)</Label>
              <Input
                id="settings-delivery-fee"
                type="number"
                step="1"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-free-threshold">
                Free Delivery Threshold (₹)
              </Label>
              <Input
                id="settings-free-threshold"
                type="number"
                step="1"
                min="0"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-min-order">
                Minimum Order Amount (₹)
              </Label>
              <Input
                id="settings-min-order"
                type="number"
                step="1"
                min="0"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-tax">GST / Tax Percentage (%)</Label>
              <Input
                id="settings-tax"
                type="number"
                step="0.1"
                min="0"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="settings-whatsapp">Kitchen WhatsApp Number</Label>
              <Input
                id="settings-whatsapp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+919876543210"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-fssai">FSSAI License Number</Label>
              <Input
                id="settings-fssai"
                value={fssaiNumber}
                onChange={(e) => setFssaiNumber(e.target.value)}
                placeholder="22726199000490"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-pincodes">
              Serviceable Pincodes (&quot;ALL&quot; or comma-separated list)
            </Label>
            <Input
              id="settings-pincodes"
              value={serviceablePincodes}
              onChange={(e) => setServiceablePincodes(e.target.value)}
              placeholder="ALL or 190001,190008,110001"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Set to <code>ALL</code> to accept orders from any pincode, or
              enter comma-separated pincodes (e.g.{" "}
              <code>190001,190008,110001</code>).
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Settings</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
