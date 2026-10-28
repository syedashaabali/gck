import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/Brand";

interface SiteHeaderLiteProps {
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}

/** Compact sticky header for secondary pages (orders, tracking). */
export function SiteHeaderLite({
  backHref,
  backLabel,
  eyebrow,
  title,
  right,
}: SiteHeaderLiteProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="mx-auto flex h-[var(--header-h)] max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Button asChild variant="outline" size="sm" className="h-9 shrink-0">
              <Link href={backHref}>
                <ArrowLeft />
                <span className="max-sm:sr-only">{backLabel}</span>
              </Link>
            </Button>
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow !text-[0.58rem]">{eyebrow}</p>}
              <h1 className="truncate font-serif text-lg font-semibold md:text-xl">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {right}
            <Link href="/" className="hidden md:block" aria-label="Home">
              <BrandMark compact />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
