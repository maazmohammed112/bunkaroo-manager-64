import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#7467E8] text-white shadow-sm shadow-[#7467E8]/20",
        secondary:
          "border-[#E8E7EF] dark:border-white/10 bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7]",
        destructive:
          "border-rose-500/20 bg-[#F7DDE9] dark:bg-rose-500/15 text-rose-700 dark:text-rose-300",
        mint:
          "border-emerald-500/20 bg-[#DDEDEA] dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
        lavender:
          "border-[#7467E8]/20 bg-[#E8E4FF] dark:bg-[#7467E8]/15 text-[#5848DF] dark:text-[#A59BFF]",
        warning:
          "border-amber-500/20 bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300",
        outline: "border border-[#E8E7EF] dark:border-white/10 text-foreground",
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
