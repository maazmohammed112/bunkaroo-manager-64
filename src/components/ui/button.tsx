import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[16px] text-xs sm:text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#7467E8] text-white hover:bg-[#6658DF] shadow-[0_4px_14px_rgba(116,103,232,0.25)] hover:shadow-[0_6px_20px_rgba(116,103,232,0.35)]",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.2)]",
        outline:
          "border border-[#E8E7EF] dark:border-white/10 bg-transparent text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#20222C]",
        secondary:
          "bg-[#F1F0F8] dark:bg-[#20222C] text-foreground hover:bg-[#E8E4FF]/60 dark:hover:bg-[#2A2D3A] border border-[#E8E7EF] dark:border-white/[0.06]",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#20222C]",
        link: "text-[#7467E8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-5 py-2",
        sm: "h-8 sm:h-9 rounded-[13px] px-3 text-xs",
        lg: "h-12 rounded-[18px] px-7 text-sm font-bold",
        icon: "h-10 w-10 rounded-[14px]",
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
