import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

const tone: Record<string, string> = {
  Compliant:
    "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--text-success)]",
  Active:
    "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--text-success)]",
  "At Risk":
    "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]",
  Pending:
    "border-[var(--border-information)] bg-[var(--background-information)] text-[var(--text-information)]",
  "Expiring Soon":
    "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]",
  "Expiring soon":
    "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]",
  "Non-compliant":
    "border-[var(--border-error)] bg-[var(--background-error)] text-[var(--text-error)]",
  Suspended:
    "border-[var(--border-error)] bg-[var(--background-error)] text-[var(--text-error)]",
  "Not Found":
    "border-[var(--border-disabled)] bg-[var(--background-disabled)] text-[var(--text-neutral-weak)]",
  Served:
    "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--text-success)]",
  "Not served":
    "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]",
  submitted:
    "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--text-success)]",
  "Queued locally":
    "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]",
  queued:
    "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]",
  Completed:
    "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--text-success)]",
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
