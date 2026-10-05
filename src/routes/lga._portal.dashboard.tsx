import { createFileRoute } from "@tanstack/react-router"
import { LgaDashboard } from "@/features/lga/lga-dashboard"

export const Route = createFileRoute("/lga/_portal/dashboard")({
  component: LgaDashboard,
})
