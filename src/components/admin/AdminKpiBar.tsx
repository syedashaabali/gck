"use client";

import React from "react";
import { Banknote, Flame, ShoppingBag, TrendingUp } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";

export interface AdminKpis {
  todayTotalOrders: number;
  activeKitchenLoad: number;
  pendingCodCash: number;
  todayDeliveredRevenue: number;
}

interface AdminKpiBarProps {
  kpis: AdminKpis;
}

export function AdminKpiBar({ kpis }: AdminKpiBarProps) {
  const cards = [
    {
      label: "Today's orders",
      shortLabel: "Orders",
      hint: "Placed since midnight",
      value: String(kpis.todayTotalOrders),
      icon: ShoppingBag,
      chip: "bg-primary/15 text-gold-light border-primary/40",
      glow: "from-gold/25",
      value_class: "text-gold-gradient",
    },
    {
      label: "Active kitchen load",
      shortLabel: "Active",
      hint: "Received + preparing",
      value: String(kpis.activeKitchenLoad),
      icon: Flame,
      chip: "bg-saffron/15 text-saffron-light border-saffron/40",
      glow: "from-saffron/25",
      value_class: "text-saffron-light",
    },
    {
      label: "COD cash in field",
      shortLabel: "COD field",
      hint: "With out-for-delivery valets",
      value: formatINR(kpis.pendingCodCash),
      icon: Banknote,
      chip: "bg-sapphire/15 text-sapphire-light border-sapphire/40",
      glow: "from-sapphire/25",
      value_class: "text-sapphire-light",
    },
    {
      label: "Delivered revenue",
      shortLabel: "Revenue",
      hint: "Settled COD today",
      value: formatINR(kpis.todayDeliveredRevenue),
      icon: TrendingUp,
      chip: "bg-jade/20 text-jade-light border-jade-light/40",
      glow: "from-jade/30",
      value_class: "text-jade-light",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map(
        ({ label, shortLabel, hint, value, icon: Icon, chip, glow, value_class }) => (
          <div
            key={label}
            className="glass relative overflow-hidden rounded-xl p-2.5 sm:rounded-2xl sm:p-5"
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute -right-10 -top-10 hidden size-36 rounded-full bg-gradient-to-br to-transparent blur-2xl sm:block",
                glow
              )}
            />
            <div className="relative flex items-start justify-between gap-2">
              <p className="truncate text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-[0.66rem] sm:tracking-[0.18em]">
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </p>
              <span
                className={cn(
                  "hidden size-9 shrink-0 items-center justify-center rounded-xl border sm:flex",
                  chip
                )}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <p
              className={cn(
                "relative mt-1 truncate font-serif text-lg font-semibold lining-nums tabular-nums sm:mt-3 sm:text-4xl",
                value_class
              )}
            >
              {value}
            </p>
            <p className="relative mt-1 hidden text-xs text-muted-foreground sm:block">
              {hint}
            </p>
          </div>
        )
      )}
    </div>
  );
}
