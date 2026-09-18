import { createFileRoute } from "@tanstack/react-router"
import { UpcomingModule } from "@/components/business/upcoming-module"

export const Route = createFileRoute("/business/_portal/applications")({
  component: () => (
    <UpcomingModule
      title="Applications"
      description="Prepare, submit, and track your certificate applications."
      delivery="Slice 2 · Fitness applications; Slice 3 · Fumigation applications"
    />
  ),
})
