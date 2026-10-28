import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/15 text-gold-light",
        secondary: "border-white/10 bg-secondary text-secondary-foreground",
        destructive: "border-ruby-light/40 bg-ruby/20 text-ruby-light",
        outline: "border-primary/30 text-foreground",
        success: "border-jade-light/40 bg-jade/20 text-jade-light",
        warning: "border-saffron/40 bg-saffron/15 text-saffron-light",
        info: "border-sapphire-light/40 bg-sapphire/20 text-sapphire-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
