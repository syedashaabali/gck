import { cn } from "@/lib/utils";

/** Gulmarg Cloud Kitchen circular crest emblem. */
export function BrandEmblem({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden
      className={cn(
        "size-10 shrink-0 rounded-full object-contain select-none",
        className
      )}
    />
  );
}

export function BrandMark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <BrandEmblem
        className={compact ? "size-9 sm:size-10" : "size-10 sm:size-11 md:size-12"}
      />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[0.95rem] font-semibold uppercase tracking-[0.22em] text-gold-gradient sm:text-lg sm:tracking-[0.34em] md:text-xl">
          Gulmarg
        </span>
        <span className="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.34em] text-muted-foreground sm:mt-1.5 sm:text-[0.58rem] sm:tracking-[0.5em]">
          Cloud Kitchen
        </span>
      </span>
    </span>
  );
}

/** Thin gold rule with a centred diamond — used between sections. */
export function Ornament({
  className,
  lineClassName,
}: {
  className?: string;
  lineClassName?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center gap-3 text-primary", className)}
    >
      <span
        className={cn(
          "h-px w-14 bg-gradient-to-r from-transparent to-primary/60 md:w-24",
          lineClassName
        )}
      />
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
      </svg>
      <span
        className={cn(
          "h-px w-14 bg-gradient-to-l from-transparent to-primary/60 md:w-24",
          lineClassName
        )}
      />
    </div>
  );
}
