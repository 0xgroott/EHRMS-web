import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router"
import { EhoOverviewPage } from "@/features/eho/eho-pages"

function OverviewRoute() {
  const { inspectionId } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  return pathname.replace(/\/$/, "") === `/eho/inspections/${inspectionId}` ? (
    <EhoOverviewPage inspectionId={inspectionId} />
  ) : (
    <Outlet />
  )
}
export const Route = createFileRoute("/eho/_portal/inspections/$inspectionId")({
  component: OverviewRoute,
})
