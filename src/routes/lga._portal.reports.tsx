import { createFileRoute } from "@tanstack/react-router"
import { LgaReportsPage } from "@/features/lga/lga-reports"

import { validateReportSearch } from "@/features/lga/lga-report-library"

export const Route = createFileRoute("/lga/_portal/reports")({
  validateSearch: validateReportSearch,
  component: LgaReportsPage,
})
