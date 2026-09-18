import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: number | string
  detail: string
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
