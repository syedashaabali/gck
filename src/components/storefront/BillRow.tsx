import React from "react";
import { cn } from "@/lib/utils";

/** Receipt line with a dotted leader between label and amount. */
export function BillRow({
  label,
  value,
  strong = false,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-2 text-sm",
        strong
          ? "pt-1 text-base font-semibold text-gold-light"
          : "text-foreground/80",
        className
      )}
    >
      <span>{label}</span>
      <span className="flex-1 translate-y-[-3px] border-b border-dotted border-primary/25" />
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
