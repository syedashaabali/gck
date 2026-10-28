"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Home,
  Briefcase,
  Building2,
  Loader2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { AddressItem } from "./LuxuryHeader";

interface AddressBookSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: AddressItem[];
  activeAddressId: string | null;
  onAddressesUpdated: (addresses: AddressItem[], selectedId?: string) => void;
}

const LABELS = [
  { id: "Home", icon: Home },
  { id: "Work", icon: Briefcase },
  { id: "Other", icon: Building2 },
] as const;

export function AddressBookSheet({
  open,
  onOpenChange,
  addresses,
  activeAddressId,
  onAddressesUpdated,
}: AddressBookSheetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("Home");
  const [fullAddress, setFullAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleSetDefault = async (addressId: string) => {
    setBusyId(addressId);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to switch delivery address.");
        return;
      }
      onAddressesUpdated(data.addresses, addressId);
      toast.success("Active delivery address updated.");
      onOpenChange(false);
    } catch {
      toast.error("Failed to switch address.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (addresses.length <= 1) {
      toast.error("You must keep at least one saved delivery address.");
      return;
    }
    setBusyId(addressId);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete address.");
        return;
      }
      onAddressesUpdated(data.addresses);
      toast.success("Address removed from your address book.");
    } catch {
      toast.error("Failed to delete address.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress.trim() || !pincode.trim()) {
      toast.error("Please provide the complete address and pincode.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          fullAddress: fullAddress.trim(),
          landmark: landmark.trim() || null,
          pincode: pincode.trim(),
          isDefault: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add address.");
        return;
      }
      onAddressesUpdated(data.addresses, data.address.id);
      setFullAddress("");
      setLandmark("");
      setPincode("");
      setShowAddForm(false);
      toast.success("New delivery address added and set as active!");
    } catch {
      toast.error("Network error while adding address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="space-y-1 border-b border-primary/15 px-4 pb-4 pt-5 text-left sm:px-6 sm:pt-6">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Royal Address Book</span>
          </SheetTitle>
          <SheetDescription>
            Select your active delivery destination or add a secondary address.
          </SheetDescription>
        </SheetHeader>

        <div className="luxury-scroller flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {addresses.map((addr) => {
            const isSelected =
              activeAddressId === addr.id ||
              (!activeAddressId && addr.isDefault);
            return (
              <div
                key={addr.id}
                className={`rounded-xl border p-4 transition ${
                  isSelected
                    ? "border-primary bg-secondary/90 shadow-md"
                    : "border-primary/20 bg-background/60 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className="uppercase tracking-wider text-[10px]"
                    >
                      {addr.label}
                    </Badge>
                    <span className="text-xs font-mono text-primary">
                      PIN: {addr.pincode}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </span>
                    )}
                  </div>

                  {addresses.length > 1 && (
                    <button
                      type="button"
                      disabled={busyId === addr.id}
                      onClick={() => handleDelete(addr.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-950/60 hover:text-red-400"
                      title="Delete Address"
                      aria-label="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm text-foreground">
                  {addr.fullAddress}
                </p>
                {addr.landmark && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Landmark: {addr.landmark}
                  </p>
                )}

                {!isSelected && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyId === addr.id}
                    onClick={() => handleSetDefault(addr.id)}
                    className="mt-3 w-full text-xs"
                  >
                    {busyId === addr.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Deliver Here"
                    )}
                  </Button>
                )}
              </div>
            );
          })}

          {!showAddForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full border-dashed border-primary/40 py-6 text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Delivery Address</span>
            </Button>
          ) : (
            <form
              onSubmit={handleCreateAddress}
              className="space-y-3 rounded-xl border border-primary/35 bg-background/90 p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-semibold text-primary">
                  Add Secondary Address
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="inline-flex min-h-8 items-center px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {LABELS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLabel(id)}
                    className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium ${
                      label === id
                        ? "border-primary bg-primary text-background"
                        : "border-primary/20 text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{id}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-addr-street">Complete Address *</Label>
                <Textarea
                  id="new-addr-street"
                  name="street-address"
                  autoComplete="street-address"
                  required
                  rows={2}
                  placeholder="House/Flat No., Building, Road, Area"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="new-addr-landmark">Landmark</Label>
                  <Input
                    id="new-addr-landmark"
                    placeholder="Near..."
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-addr-pincode">Pincode *</Label>
                  <Input
                    id="new-addr-pincode"
                    name="postal-code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    maxLength={6}
                    placeholder="190001"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Set Active Address</span>
                )}
              </Button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
