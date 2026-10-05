import { createFileRoute } from "@tanstack/react-router"
import { LgaInspectionsPage } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/inspections")({
  component: LgaInspectionsPage,
})
