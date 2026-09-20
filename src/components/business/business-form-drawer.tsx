import type { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function BusinessFormDrawer({
  title,
  description,
  compactPadding = false,
  onClose,
  children,
}: {
  title: string
  description?: string
  compactPadding?: boolean
  onClose: () => void
  children: ReactNode
}) {
  const horizontalPadding = compactPadding ? "px-4" : "px-5 sm:px-8"

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-[52.8rem]">
        <SheetHeader className={`shrink-0 border-b py-4 ${horizontalPadding}`}>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto py-6 sm:py-8 ${horizontalPadding}`}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
