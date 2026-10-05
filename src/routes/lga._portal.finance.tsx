import { createFileRoute } from "@tanstack/react-router"
import { LgaFinancePage } from "@/features/lga/lga-finance"

import { validateFinanceSearch } from "@/features/lga/lga-finance-filters"

export const Route = createFileRoute("/lga/_portal/finance")({
  validateSearch: validateFinanceSearch,
  component: LgaFinancePage,
})
