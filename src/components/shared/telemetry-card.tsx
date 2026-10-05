import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TelemetryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <Card size="sm" className="min-h-28">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardAction>
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent className="mt-auto">
        <strong className="text-3xl font-semibold tabular-nums">{value}</strong>
      </CardContent>
    </Card>
  )
}
