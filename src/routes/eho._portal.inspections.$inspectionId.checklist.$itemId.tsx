import { createFileRoute } from "@tanstack/react-router"
import { EhoChecklistPage } from "@/features/eho/eho-inspection-pages"

function ChecklistItemRoute() {
  const { inspectionId, itemId } = Route.useParams()
  return <EhoChecklistPage inspectionId={inspectionId} itemId={itemId} />
}

export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/checklist/$itemId"
)({ component: ChecklistItemRoute })
