import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { FumigationStage } from "./fumigation-types"

export const fumigationStageLabel: Record<FumigationStage, string> = {
  draft: "Draft application",
  review: "Ready for payment",
  "awaiting-provider": "Awaiting provider report",
  "report-submitted": "Report submitted",
  "eho-confirmed": "Awaiting council decision",
  issued: "Certificate issued",
}

export function formatNgn(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

export function FumigationLink({
  href,
  children,
  variant = "default",
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline" | "link"
  className?: string
}) {
  return (
    <Button
      nativeButton={false}
      role="link"
      render={<Link to={href.split("#")[0]} hash={href.split("#")[1]} />}
      variant={variant}
      className={cn(
        "min-h-11 max-w-full text-left whitespace-normal",
        className
      )}
    >
      {children}
    </Button>
  )
}

export function FumigationLoading() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">Loading Fumigation records</span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
