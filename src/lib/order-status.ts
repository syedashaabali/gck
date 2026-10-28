import type { BadgeProps } from "@/components/ui/badge";

export type OrderStatusKey =
  | "RECEIVED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

interface StatusMeta {
  label: string;
  badge: NonNullable<BadgeProps["variant"]>;
  /** Tailwind text colour for headings in this state */
  text: string;
  /** Tailwind gradient/border accent used for KDS column strips */
  accent: string;
  /** Card border + glow for KDS cards */
  card: string;
}

export const ORDER_STATUS: Record<OrderStatusKey, StatusMeta> = {
  RECEIVED: {
    label: "Received",
    badge: "default",
    text: "text-gold-light",
    accent: "from-gold-deep via-gold to-gold-light",
    card: "border-primary/50 shadow-[0_0_40px_-18px_hsl(var(--gold)/0.7)]",
  },
  PREPARING: {
    label: "Preparing",
    badge: "warning",
    text: "text-saffron-light",
    accent: "from-saffron/60 via-saffron to-saffron-light",
    card: "border-saffron/40",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    badge: "info",
    text: "text-sapphire-light",
    accent: "from-sapphire/60 via-sapphire to-sapphire-light",
    card: "border-sapphire/40",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "success",
    text: "text-jade-light",
    accent: "from-jade/60 via-jade to-jade-light",
    card: "border-jade/40",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "destructive",
    text: "text-ruby-light",
    accent: "from-ruby/60 via-ruby to-ruby-light",
    card: "border-ruby/40 opacity-80",
  },
};
