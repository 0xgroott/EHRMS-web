import { createFileRoute } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { BusinessDashboard } from "@/components/business/business-dashboard"
import { useFitness } from "@/features/fitness/fitness-context"

export const Route = createFileRoute("/business/_portal/dashboard")({
  component: BusinessDashboardRoute,
})

function BusinessDashboardRoute() {
  const { state } = useBusinessSession()
  const { state: fitness, isHydrated } = useFitness()
  if (!isHydrated) return <p role="status">Loading business dashboard…</p>
  return <BusinessDashboard state={state} fitness={fitness} />
}
