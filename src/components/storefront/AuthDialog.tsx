"use client";

import React, { useState, useEffect } from "react";
import { Phone, KeyRound, ArrowLeft, Loader2 } from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import type { AuthenticatedUser } from "./LuxuryHeader";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: AuthenticatedUser) => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!open) {
      setStep("PHONE");
      setOtp("");
    }
  }, [open]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (cleaned.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
        toast.error(data.error || "Unable to send OTP.");
        return;
      }

      setPhone(cleaned);
      setStep("OTP");
      setCooldown(30); // Enforce 30-second resend cooldown timer

      if (data.providerError) {
        toast.warning(`Fast2SMS: ${data.providerError}`, {
          duration: 8000,
          description: data.devOtp
            ? `Fallback Dev OTP: ${data.devOtp}`
            : undefined,
        });
      }

      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
        if (!data.providerError) {
          toast.success(`Gulmarg Dev OTP: ${data.devOtp}`, {
            duration: 12000,
            description: "Enter this 6-digit code to verify your mobile number.",
          });
        }
      } else {
        setDevOtpHint(null);
        toast.success(`OTP sent via SMS to +91 ${cleaned}`);
      }
    } catch {
      toast.error("Network error while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid OTP code.");
        return;
      }

      toast.success(
        data.user.isOnboarded
          ? `Welcome back, ${data.user.name || "Royal Guest"}!`
          : "Phone verified! Please complete your delivery address."
      );
      onOpenChange(false);
      onSuccess(data.user);
    } catch {
      toast.error("Network error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <BrandEmblem className="mb-1 size-12" />
          <DialogTitle className="text-2xl">
            {step === "PHONE"
              ? "Sign In to Gulmarg Royal Dining"
              : "Verify Your Mobile Number"}
          </DialogTitle>
          <DialogDescription>
            {step === "PHONE"
              ? "Enter your 10-digit mobile number to receive a one-time verification code."
              : `Enter the 6-digit OTP sent to +91 ${phone}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "PHONE" ? (
          /* Modern Web Guidance: autofill-sign-in-form */
          <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="signin-phone">Mobile Number (10 Digits)</Label>
              <div className="relative flex items-center">
                <span className="inline-flex h-10 items-center rounded-l-lg border border-r-0 border-primary/25 bg-secondary px-3 text-sm font-medium text-primary">
                  +91
                </span>
                <Input
                  id="signin-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  enterKeyHint="send"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="rounded-l-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  <span>Send Verification OTP</span>
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5 pt-2">
            {devOtpHint && (
              <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs">
                <span className="text-foreground">
                  Dev Mode OTP:{" "}
                  <strong className="font-mono text-sm text-primary">
                    {devOtpHint}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtpHint)}
                  className="inline-flex min-h-8 items-center px-2 font-semibold text-primary underline hover:text-gold-light"
                >
                  Tap to Fill
                </button>
              </div>
            )}

            <div className="space-y-2 text-center">
              <Label htmlFor="otp-input" className="block text-center">
                6-Digit Verification Code
              </Label>
              <div className="flex justify-center py-1">
                <InputOTP
                  id="otp-input"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(value) => setOtp(value.replace(/\D/g, ""))}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Verify & Sign In</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("PHONE");
                  setOtp("");
                }}
                className="inline-flex min-h-8 items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Change Number</span>
              </button>

              <button
                type="button"
                disabled={cooldown > 0 || loading}
                onClick={() => handleSendOtp()}
                className="inline-flex min-h-8 items-center font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Resend OTP Code"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
