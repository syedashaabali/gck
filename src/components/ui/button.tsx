import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gold-gradient text-primary-foreground shadow-gold hover:brightness-110 hover:shadow-gold-lg",
        destructive:
          "bg-gradient-to-b from-ruby-light to-ruby text-white shadow-ruby hover:brightness-110",
        outline:
          "border border-primary/30 bg-white/[0.03] text-foreground backdrop-blur-sm hover:border-primary/60 hover:bg-primary/10 hover:text-gold-light",
        secondary:
          "border border-white/5 bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-foreground hover:bg-primary/10 hover:text-gold-light",
        link: "text-primary underline-offset-4 hover:underline",
        jade: "bg-gradient-to-b from-jade-light to-jade text-white shadow-jade hover:brightness-110",
        sapphire:
          "bg-gradient-to-b from-sapphire-light to-sapphire text-white shadow-[0_10px_30px_-10px_hsl(var(--sapphire)/0.6)] hover:brightness-110",
        saffron:
          "bg-gradient-to-b from-saffron-light to-saffron text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--saffron)/0.6)] hover:brightness-110",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
