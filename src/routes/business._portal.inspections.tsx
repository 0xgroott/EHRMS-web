import { createFileRoute } from "@tanstack/react-router"
import { InspectionPage } from "@/features/inspection/inspection-page"

export const Route = createFileRoute("/business/_portal/inspections")({
  component: InspectionPage,
})
