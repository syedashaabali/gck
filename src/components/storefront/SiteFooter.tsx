import React from "react";
import Link from "next/link";
import { BrandMark, Ornament } from "@/components/brand/Brand";

interface SiteFooterProps {
  storeName: string;
  fssaiNumber: string;
  whatsappNumber: string;
}

export function SiteFooter({
  storeName,
  fssaiNumber,
  whatsappNumber,
}: SiteFooterProps) {
  return (
    <footer className="relative mt-20 border-t border-primary/20 bg-gradient-to-b from-transparent to-black/60 px-4 pb-28 pt-14 text-center sm:px-6 sm:pb-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <BrandMark className="justify-center" />
        <Ornament />
        <p className="max-w-xl font-script text-xl italic leading-snug text-foreground/80">
          &ldquo;Where every meal is a banquet, and every guest, royalty.&rdquo;
        </p>

        <dl className="grid w-full gap-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="eyebrow !text-[0.6rem]">FSSAI Licence</dt>
            <dd className="mt-1.5 font-mono text-xs text-foreground/80">
              {fssaiNumber}
            </dd>
          </div>
          <div>
            <dt className="eyebrow !text-[0.6rem]">WhatsApp Concierge</dt>
            <dd className="mt-1.5 text-xs text-foreground/80">
              {whatsappNumber}
            </dd>
          </div>
          <div>
            <dt className="eyebrow !text-[0.6rem]">Payment</dt>
            <dd className="mt-1.5 text-xs text-foreground/80">
              Cash or UPI on delivery
            </dd>
          </div>
        </dl>

        <p className="text-[0.7rem] text-muted-foreground">
          © {new Date().getFullYear()} {storeName}. Freshly prepared to order.
          {" · "}
          <Link
            href="/admin"
            className="inline-flex min-h-8 items-center px-1 underline-offset-4 transition hover:text-gold-light hover:underline"
          >
            Kitchen console
          </Link>
        </p>
      </div>
    </footer>
  );
}
