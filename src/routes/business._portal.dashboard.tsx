import { createFileRoute } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { BusinessDashboard } from "@/components/business/business-dashboard"

export const Route = createFileRoute("/business/_portal/dashboard")({
  component: BusinessDashboardRoute,
})

function BusinessDashboardRoute() {
  const { state } = useBusinessSession()
  return <BusinessDashboard state={state} />
}
