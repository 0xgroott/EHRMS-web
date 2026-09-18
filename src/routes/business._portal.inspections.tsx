import { createFileRoute } from "@tanstack/react-router"
import { UpcomingModule } from "@/components/business/upcoming-module"

export const Route = createFileRoute("/business/_portal/inspections")({
  component: () => (
    <UpcomingModule
      title="Inspections"
      description="View inspection visits, review findings, and respond to corrective actions."
      delivery="Slice 4 · Health Approval, inspections, and corrective actions"
    />
  ),
})
