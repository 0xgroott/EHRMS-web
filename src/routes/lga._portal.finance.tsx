import { createFileRoute } from "@tanstack/react-router"
import { LgaFinancePage } from "@/features/lga/lga-finance"

export const Route = createFileRoute("/lga/_portal/finance")({
  component: LgaFinancePage,
})
