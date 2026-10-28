"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  MapPin,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandMark } from "@/components/brand/Brand";
import { formatINR } from "@/lib/utils";

export interface AddressItem {
  id: string;
  label: string;
  fullAddress: string;
  landmark: string | null;
  pincode: string;
  isDefault: boolean;
}

export interface AuthenticatedUser {
  id: string;
  phone: string;
  name: string | null;
  role: "CUSTOMER" | "ADMIN";
  isOnboarded: boolean;
  addresses: AddressItem[];
}

interface LuxuryHeaderProps {
  storeName?: string;
  user: AuthenticatedUser | null;
  activeAddress: AddressItem | null;
  cartCount: number;
  cartSubtotal: number;
  isKitchenOpen: boolean;
  freeDeliveryThreshold: number;
  onOpenAuth: () => void;
  onOpenAddressBook: () => void;
  onOpenCart: () => void;
  onLogout: () => void;
}

function initialsOf(user: AuthenticatedUser): string {
  const source = user.name?.trim() || user.phone;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function LuxuryHeader({
  user,
  activeAddress,
  cartCount,
  cartSubtotal,
  isKitchenOpen,
  freeDeliveryThreshold,
  onOpenAuth,
  onOpenAddressBook,
  onOpenCart,
  onLogout,
}: LuxuryHeaderProps) {
  const addressReady = Boolean(user?.isOnboarded && activeAddress);

  return (
    <>
      {/* Announcement + delivery address strip */}
      <div className="border-b border-primary/15 bg-gradient-to-r from-ruby/35 via-background/60 to-jade/25">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <p className="hidden items-center gap-2 text-[0.72rem] tracking-wide text-muted-foreground md:flex">
            <Truck className="size-3.5 text-primary" />
            <span>
              Complimentary delivery above{" "}
              <strong className="font-semibold text-gold-light">
                {formatINR(freeDeliveryThreshold)}
              </strong>
            </span>
            <span className="text-primary/50">◆</span>
            <span>Cash or UPI at your doorstep</span>
          </p>

          <button
            type="button"
            onClick={() => (user ? onOpenAddressBook() : onOpenAuth())}
            className="group flex min-h-8 min-w-0 max-w-full items-center gap-2 py-1.5 text-[0.72rem] text-foreground/90 transition hover:text-gold-light md:ml-auto"
          >
            <MapPin className="size-3.5 shrink-0 text-primary" />
            {addressReady && activeAddress ? (
              <>
                <span className="shrink-0 font-semibold uppercase tracking-[0.2em] text-primary">
                  {activeAddress.label}
                </span>
                <span className="truncate">
                  {activeAddress.fullAddress} · {activeAddress.pincode}
                </span>
              </>
            ) : (
              <span className="truncate">
                {user
                  ? "Add a delivery address"
                  : "Sign in to set your delivery address"}
              </span>
            )}
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition group-hover:text-gold-light" />
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <header className="site-header">
        <div className="site-header-inner">
          <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
            <Link
              href="/"
              aria-label="Gulmarg Cloud Kitchen — home"
              className="shrink-0"
            >
              <BrandMark />
            </Link>

            <nav
              aria-label="Primary"
              className="hidden items-center gap-9 md:flex"
            >
              {[
                { href: "#signatures", label: "Signatures" },
                { href: "#menu", label: "The Menu" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-foreground/80 transition hover:text-gold-light"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/orders"
                className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-foreground/80 transition hover:text-gold-light"
              >
                My Orders
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <Badge
                variant={isKitchenOpen ? "success" : "destructive"}
                className="hidden gap-1.5 lg:inline-flex"
              >
                <span
                  className={`size-1.5 rounded-full ${
                    isKitchenOpen
                      ? "animate-pulse-ring bg-jade-light"
                      : "bg-ruby-light"
                  }`}
                />
                {isKitchenOpen ? "Kitchen open" : "Kitchen closed"}
              </Badge>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full border border-primary/25 bg-white/[0.03] p-1 transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pr-3"
                      aria-label="Account menu"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-gold-gradient text-xs font-bold text-primary-foreground">
                          {initialsOf(user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-[7rem] truncate text-sm font-medium lg:inline">
                        {user.name || `+91 ${user.phone}`}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="space-y-0.5">
                      <p className="font-serif text-base">
                        {user.name || "Royal Guest"}
                      </p>
                      <p className="text-xs font-normal text-muted-foreground">
                        +91 {user.phone}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-primary/15" />
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <ScrollText /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onOpenAddressBook}>
                      <MapPin /> Delivery Addresses
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck /> Kitchen Console
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary/15" />
                    <DropdownMenuItem
                      onSelect={onLogout}
                      className="text-ruby-light focus:bg-ruby/20 focus:text-ruby-light"
                    >
                      <LogOut /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full md:hidden"
                  >
                    <Link href="/orders" aria-label="My Orders" title="My Orders">
                      <ScrollText className="size-4 text-primary" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenAuth}
                    className="h-9 gap-1.5 px-3 sm:gap-2 sm:px-4"
                  >
                    <UserIcon />
                    <span>Sign in</span>
                  </Button>
                </>
              )}

              <Button
                onClick={onOpenCart}
                className="h-9 gap-1.5 px-2.5 sm:gap-2 sm:px-4"
                aria-label={`Open cart, ${cartCount} items`}
              >
                <ShoppingBag />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="rounded-full bg-black/85 px-1.5 py-0.5 text-[0.68rem] font-bold text-gold-light sm:px-2 sm:text-[0.7rem]">
                    {cartCount}
                    <span className="hidden sm:inline">
                      {" "}
                      · {formatINR(cartSubtotal)}
                    </span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
