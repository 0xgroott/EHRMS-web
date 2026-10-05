import { validateInspectionSearch } from "@/features/lga/lga-inspection-filters"
import { createFileRoute } from "@tanstack/react-router"
import { LgaInspectionsPage } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/inspections")({
  validateSearch: validateInspectionSearch,
  component: LgaInspectionsPage,
})
