import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[16px] border border-[#E8E7EF] dark:border-white/10 bg-[#F1F0F8]/70 dark:bg-[#20222C]/80 px-4 py-2 text-sm text-foreground transition-all placeholder:text-[#9292A2] dark:placeholder:text-[#888B98] focus-visible:outline-none focus-visible:bg-white dark:focus-visible:bg-[#252733] focus-visible:border-[#7467E8] focus-visible:ring-2 focus-visible:ring-[#7467E8]/25 disabled:cursor-not-allowed disabled:opacity-50 font-sans",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
