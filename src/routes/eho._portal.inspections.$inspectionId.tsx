import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router"
import { EhoInspectionJourneyLayout } from "@/features/eho/eho-inspection-journey-layout"
import { EhoOverviewPage } from "@/features/eho/eho-pages"

function OverviewRoute() {
  const { inspectionId } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  const normalizedPath = pathname.replace(/\/$/, "")
  if (normalizedPath === `/eho/inspections/${inspectionId}`)
    return <EhoOverviewPage inspectionId={inspectionId} />
  if (normalizedPath === `/eho/inspections/${inspectionId}/notice`)
    return <Outlet />
  return (
    <EhoInspectionJourneyLayout inspectionId={inspectionId} pathname={pathname}>
      <Outlet />
    </EhoInspectionJourneyLayout>
  )
}
export const Route = createFileRoute("/eho/_portal/inspections/$inspectionId")({
  component: OverviewRoute,
})
