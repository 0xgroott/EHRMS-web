import { createFileRoute } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { BusinessDashboard } from "@/components/business/business-dashboard"
import { useFitness } from "@/features/fitness/fitness-context"
import { useFumigation } from "@/features/fumigation/fumigation-context"
import { useInspection } from "@/features/inspection/inspection-context"
import { useBusinessMedia } from "@/features/business-media/business-media-context"

export const Route = createFileRoute("/business/_portal/dashboard")({
  component: BusinessDashboardRoute,
})

function BusinessDashboardRoute() {
  const { state } = useBusinessSession()
  const { state: fitness, isHydrated } = useFitness()
  const { state: fumigation, isHydrated: fumigationIsHydrated } =
    useFumigation()
  const { state: inspection, isHydrated: inspectionIsHydrated } =
    useInspection()
  const { media, isHydrated: mediaIsHydrated } = useBusinessMedia()
  if (
    !isHydrated ||
    !fumigationIsHydrated ||
    !inspectionIsHydrated ||
    !mediaIsHydrated
  )
    return <p role="status">Loading business dashboard…</p>
  return (
    <BusinessDashboard
      state={state}
      fitness={fitness}
      fumigation={fumigation}
      inspection={inspection}
      premisesPhoto={media.photos.find(Boolean)?.dataUrl}
    />
  )
}
