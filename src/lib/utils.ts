import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function isPincodeServiceable(
  pincode: string,
  serviceablePincodes: string
): boolean {
  if (!serviceablePincodes) return true;
  const normalizedConfig = serviceablePincodes.trim().toUpperCase();
  if (normalizedConfig === "ALL" || normalizedConfig === "*") {
    return true;
  }
  const cleanPin = pincode.trim();
  if (!cleanPin) return false;
  const allowedList = serviceablePincodes
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return allowedList.includes(cleanPin);
}

export function formatElapsedTime(createdAt: string | Date): string {
  const created = new Date(createdAt).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - created) / 1000));
  if (diffSec < 60) return "Just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
