import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router"
import { EhoChecklistPage } from "@/features/eho/eho-inspection-pages"

function ChecklistRoute() {
  const { inspectionId } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  if (
    pathname.replace(/\/$/, "") !== `/eho/inspections/${inspectionId}/checklist`
  )
    return <Outlet />
  return <EhoChecklistPage inspectionId={inspectionId} />
}
export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/checklist"
)({ component: ChecklistRoute })
