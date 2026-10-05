import { createFileRoute } from "@tanstack/react-router"
import { LgaReportsPage } from "@/features/lga/lga-reports"

export const Route = createFileRoute("/lga/_portal/reports")({
  component: LgaReportsPage,
})
