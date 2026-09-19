import { createFileRoute } from "@tanstack/react-router"
import { HealthApprovalPage } from "@/features/inspection/health-approval-page"

export const Route = createFileRoute("/business/_portal/health-approval")({
  component: HealthApprovalPage,
})
