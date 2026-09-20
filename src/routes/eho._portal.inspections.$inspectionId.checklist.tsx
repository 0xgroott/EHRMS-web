import { createFileRoute } from "@tanstack/react-router"
import { EhoChecklistPage } from "@/features/eho/eho-inspection-pages"

function ChecklistRoute() {
  const { inspectionId } = Route.useParams()
  return <EhoChecklistPage inspectionId={inspectionId} />
}
export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/checklist"
)({ component: ChecklistRoute })
