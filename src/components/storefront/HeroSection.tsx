"use client";

import React from "react";
import { ArrowRight, ChefHat, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ornament } from "@/components/brand/Brand";
import { formatINR } from "@/lib/utils";

interface HeroSectionProps {
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  fssaiNumber: string;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=2000&q=75";

export function HeroSection({
  freeDeliveryThreshold,
  minOrderAmount,
  fssaiNumber,
}: HeroSectionProps) {
  const highlights = [
    {
      icon: Truck,
      title: "Complimentary Delivery",
      sub: `On orders above ${formatINR(freeDeliveryThreshold)}`,
    },
    {
      icon: ChefHat,
      title: "Cooked to Order",
      sub: `Minimum order ${formatINR(minOrderAmount)}`,
    },
    {
      icon: ShieldCheck,
      title: "FSSAI Licensed",
      sub: `Lic. ${fssaiNumber}`,
    },
  ];

  return (
    <section className="relative isolate overflow-hidden">
      {/* LCP image — highest fetch priority, never lazy (Modern Web Guidance: optimize-image-priority) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt=""
        width={2000}
        height={1333}
        fetchPriority="high"
        className="absolute inset-0 -z-30 size-full object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(75%_65%_at_50%_0%,hsl(var(--ruby)/0.42),transparent_72%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(55%_50%_at_90%_100%,hsl(var(--jade)/0.30),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/55 to-background" />

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-10 text-center sm:px-6 sm:pb-14 sm:pt-14 md:pb-24 md:pt-24">
        <p className="animate-fade-up font-script text-xl italic text-gold-light md:text-2xl">
          An evening in the valley of flowers
        </p>
        <Ornament className="animate-fade-up mt-3 [animation-delay:80ms]" />

        <h1 className="animate-fade-up mt-6 font-serif text-[2.35rem] font-semibold leading-[1.08] tracking-tight [animation-delay:140ms] sm:mt-7 sm:text-6xl md:text-7xl">
          The Art of{" "}
          <span className="gold-shimmer animate-shimmer pr-1 font-script text-[1.14em] font-semibold italic">
            Kashmiri
          </span>{" "}
          Wazwan,
          <br className="hidden sm:block" /> Delivered to Your Door
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-3xl text-base leading-relaxed text-foreground/75 [animation-delay:220ms] md:text-lg">
          Slow-braised for hours by master Wazas, finished with Pampore saffron
          and heirloom spices — the grandeur of a Gulmarg banquet, served
          piping hot at your table.
        </p>

        <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:300ms] sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="#menu">
              Explore the Menu <ArrowRight />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <a href="#signatures">Chef&apos;s Signatures</a>
          </Button>
        </div>

        <div className="glass animate-fade-up mx-auto mt-14 grid max-w-4xl grid-cols-1 divide-y divide-primary/15 overflow-hidden rounded-2xl text-left [animation-delay:380ms] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {highlights.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-4 px-5 py-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-gold-light">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-serif text-base font-semibold">{title}</p>
                <p className="truncate text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
