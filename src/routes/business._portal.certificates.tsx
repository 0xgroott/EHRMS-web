import { createFileRoute } from "@tanstack/react-router"
import { UpcomingModule } from "@/components/business/upcoming-module"

export const Route = createFileRoute("/business/_portal/certificates")({
  component: () => (
    <UpcomingModule
      title="Certificates"
      description="View your issued certificates, check their validity, and track renewals."
      delivery="Slices 2–4 · Fitness, Fumigation, and Health Approval"
    />
  ),
})
