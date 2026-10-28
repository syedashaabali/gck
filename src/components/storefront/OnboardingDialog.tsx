"use client";

import React, { useState } from "react";
import { MapPin, Loader2, Home, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrandEmblem } from "@/components/brand/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AuthenticatedUser } from "./LuxuryHeader";

interface OnboardingDialogProps {
  open: boolean;
  user: AuthenticatedUser | null;
  onComplete: (updatedUser: AuthenticatedUser) => void;
}

const LABELS = [
  { id: "Home", icon: Home },
  { id: "Work", icon: Briefcase },
  { id: "Other", icon: Building2 },
] as const;

export function OnboardingDialog({
  open,
  user,
  onComplete,
}: OnboardingDialogProps) {
  const [name, setName] = useState(user?.name || "");
  const [fullAddress, setFullAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [label, setLabel] = useState<string>("Home");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullAddress.trim() || !pincode.trim()) {
      toast.error("Please fill in your full name, delivery address, and pincode.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          fullAddress: fullAddress.trim(),
          landmark: landmark.trim() || null,
          pincode: pincode.trim(),
          label,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save profile.");
        return;
      }

      toast.success("Royal profile & delivery address saved!");
      onComplete(data.user);
    } catch {
      toast.error("Network error while saving profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        hideCloseButton
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <BrandEmblem className="mb-0.5 size-10 sm:mb-1 sm:size-12" />
          <DialogTitle className="text-xl sm:text-2xl">
            Complete Your Royal Delivery Profile
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Welcome to Gulmarg Cloud Kitchen. Please share your name and primary
            doorstep delivery address to begin ordering.
          </DialogDescription>
        </DialogHeader>

        {/* Modern Web Guidance: autofill-address-form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1 sm:space-y-4 sm:pt-2">
          <div className="space-y-1">
            <Label htmlFor="onboarding-name">Full Name *</Label>
            <Input
              id="onboarding-name"
              name="name"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              required
              placeholder="e.g., Zoya Mir"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="onboarding-address">
              Complete Delivery Address (House/Flat, Street) *
            </Label>
            <Textarea
              id="onboarding-address"
              name="street-address"
              autoComplete="street-address"
              required
              rows={2}
              placeholder="e.g., Villa 14, Boulevard Road, Near Dal Gate, Srinagar"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1">
              <Label htmlFor="onboarding-landmark">Nearby Landmark</Label>
              <Input
                id="onboarding-landmark"
                name="landmark"
                type="text"
                enterKeyHint="next"
                placeholder="e.g., Near Polo View"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="onboarding-pincode">Pincode *</Label>
              <Input
                id="onboarding-pincode"
                name="postal-code"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                enterKeyHint="done"
                required
                maxLength={6}
                placeholder="e.g., 190001"
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Address Label</Label>
            <div className="grid grid-cols-3 gap-2">
              {LABELS.map(({ id, icon: Icon }) => {
                const active = label === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLabel(id)}
                    className={`flex min-h-9 items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-background shadow-sm"
                        : "border-primary/25 bg-background/60 text-foreground hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Royal Profile...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Save Royal Address & Explore Menu</span>
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
