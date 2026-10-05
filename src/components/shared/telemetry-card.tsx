import { cn } from "cn"
import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TelemetryCard({
  label,
  value,
  icon: Icon,
  description,
  className,
}: {
  label: string
  value: number | string
  icon?: LucideIcon
  description?: string
  className?: string
}) {
  return (
    <Card size="sm" className={cn("min-h-28", className)}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {Icon && (
          <CardAction>
            <Icon className="size-5 text-primary" aria-hidden="true" />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        <strong className="text-3xl font-semibold tabular-nums">{value}</strong>
      </CardContent>
    </Card>
  )
}
