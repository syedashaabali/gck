"use client";

import React from "react";
import { Minus, Plus, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatINR } from "@/lib/utils";
import type { DishRecord } from "@/store/useCartStore";

interface DishCardProps {
  dish: DishRecord;
  quantityInCart: number;
  isKitchenOpen: boolean;
  variant?: "row" | "feature";
  priority?: boolean;
  onAdd: (dish: DishRecord) => void;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
}

function DietMark({ veg }: { veg: boolean }) {
  return (
    <span
      title={veg ? "Pure vegetarian" : "Non-vegetarian"}
      className={cn(
        "flex size-[1.15rem] items-center justify-center rounded-[4px] border-[1.5px] bg-black/70 backdrop-blur",
        veg ? "border-jade-light" : "border-ruby-light"
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          veg ? "bg-jade-light" : "bg-ruby-light"
        )}
      />
      <span className="sr-only">{veg ? "Pure vegetarian" : "Non-vegetarian"}</span>
    </span>
  );
}

function Stepper({
  dish,
  quantity,
  isKitchenOpen,
  onAdd,
  onUpdateQuantity,
}: Pick<
  DishCardProps,
  "dish" | "isKitchenOpen" | "onAdd" | "onUpdateQuantity"
> & { quantity: number }) {
  if (!dish.isAvailable) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Unavailable
      </Button>
    );
  }

  if (quantity > 0) {
    return (
      <div className="inline-flex items-center rounded-full border border-primary/60 bg-black/50 p-0.5 shadow-gold">
        <button
          type="button"
          onClick={() => onUpdateQuantity(dish.id, Math.max(0, quantity - 1))}
          className="flex size-8 items-center justify-center rounded-full text-gold-light transition hover:bg-primary/20"
          aria-label={`Decrease quantity of ${dish.name}`}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="min-w-8 text-center text-sm font-bold tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(dish.id, quantity + 1)}
          disabled={!isKitchenOpen}
          className="flex size-8 items-center justify-center rounded-full text-gold-light transition hover:bg-primary/20 disabled:opacity-40"
          aria-label={`Increase quantity of ${dish.name}`}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      disabled={!isKitchenOpen}
      onClick={() => onAdd(dish)}
      className="h-9 rounded-full px-5"
    >
      <Plus />
      Add
    </Button>
  );
}

export function DishCard({
  dish,
  quantityInCart,
  isKitchenOpen,
  variant = "row",
  priority = false,
  onAdd,
  onUpdateQuantity,
}: DishCardProps) {
  const veg = dish.dietaryType === "VEG";
  const unavailable = !dish.isAvailable;

  if (variant === "feature") {
    return (
      <article
        className={cn(
          "group relative flex h-full w-[16.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-gold-lg sm:w-[18.5rem]",
          unavailable && "opacity-60 grayscale-[0.5]"
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dish.imageUrl}
            alt={dish.name}
            loading={priority ? undefined : "lazy"}
            className="size-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <DietMark veg={veg} />
            <Badge className="border-primary/50 bg-black/60 backdrop-blur">
              <Sparkles className="size-3" /> Signature
            </Badge>
          </div>
          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <Badge variant="destructive" className="px-3 py-1 uppercase tracking-[0.2em]">
                Currently unavailable
              </Badge>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 space-y-1 p-4">
            <h3 className="font-serif text-xl font-semibold leading-tight">
              {dish.name}
            </h3>
            <p className="line-clamp-2 text-xs text-foreground/70">
              {dish.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="eyebrow !text-[0.58rem] !text-muted-foreground">
              {dish.servesInfo}
            </p>
            <p className="font-serif text-xl font-semibold text-gold-gradient">
              {formatINR(dish.price)}
            </p>
          </div>
          <Stepper
            dish={dish}
            quantity={quantityInCart}
            isKitchenOpen={isKitchenOpen}
            onAdd={onAdd}
            onUpdateQuantity={onUpdateQuantity}
          />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-sm transition duration-300 hover:border-primary/45 hover:bg-card/80 hover:shadow-gold-lg",
        unavailable && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex gap-4 p-3 sm:gap-5 sm:p-4">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-primary/25 sm:size-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dish.imageUrl}
            alt={dish.name}
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute left-2 top-2">
            <DietMark veg={veg} />
          </div>
          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-2 text-center">
              <span className="text-[0.6rem] font-bold uppercase leading-tight tracking-[0.18em] text-ruby-light">
                Currently unavailable
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-gold-light sm:text-xl">
              {dish.name}
            </h3>
            {dish.isSignature && (
              <Badge className="hidden shrink-0 sm:inline-flex">
                <Sparkles className="size-3" /> Signature
              </Badge>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground sm:line-clamp-3">
            {dish.description}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-muted-foreground">
            <Users className="size-3 text-primary/80" />
            {dish.servesInfo}
            <span className="text-primary/40">◆</span>
            +{formatINR(dish.packagingCharge)} packaging
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <p className="font-serif text-xl font-semibold text-gold-gradient sm:text-2xl">
              {formatINR(dish.price)}
            </p>
            <Stepper
              dish={dish}
              quantity={quantityInCart}
              isKitchenOpen={isKitchenOpen}
              onAdd={onAdd}
              onUpdateQuantity={onUpdateQuantity}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
