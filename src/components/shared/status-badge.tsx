import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

const tone: Record<string, string> = {
  Compliant: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "At Risk": "border-amber-200 bg-amber-50 text-amber-800",
  "Expiring Soon": "border-amber-200 bg-amber-50 text-amber-800",
  "Non-compliant": "border-red-200 bg-red-50 text-red-800",
  Suspended: "border-red-200 bg-red-50 text-red-800",
  "Not Found": "border-slate-300 bg-slate-100 text-slate-700",
  Served: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Not served": "border-amber-200 bg-amber-50 text-amber-800",
  submitted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Queued locally": "border-amber-200 bg-amber-50 text-amber-800",
  queued: "border-amber-200 bg-amber-50 text-amber-800",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      data-status={status.toLowerCase().replace(/\s+/g, "-")}
      className={cn("font-medium", tone[status])}
    >
      {status}
    </Badge>
  )
}
