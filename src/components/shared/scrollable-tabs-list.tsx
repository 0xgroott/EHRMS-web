import type { ComponentProps } from "react"
import { TabsList } from "@/components/ui/tabs"
import { cn } from "cn"

export function ScrollableTabsList({
  className,
  ...props
}: ComponentProps<typeof TabsList>) {
  return (
    <div className="overflow-x-auto overflow-y-hidden border-b pb-1.5">
      <TabsList
        variant="line"
        className={cn(
          "min-h-11 w-max min-w-full justify-start gap-5 px-0 sm:gap-7",
          className
        )}
        {...props}
      />
    </div>
  )
}
