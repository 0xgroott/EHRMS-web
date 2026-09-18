import { createFileRoute } from "@tanstack/react-router"
import { UpcomingModule } from "@/components/business/upcoming-module"

export const Route = createFileRoute("/business/_portal/profile")({
  component: () => (
    <UpcomingModule
      title="Business profile"
      description="Review your business contact details, registered premises, and supporting documents."
      delivery="Slice 2 · Business profile management"
    />
  ),
})
