import { createFileRoute } from "@tanstack/react-router"
import { EhoIssuePage } from "@/features/eho/eho-inspection-pages"

function IssueRoute() {
  const { inspectionId, itemId } = Route.useParams()
  return <EhoIssuePage inspectionId={inspectionId} itemId={itemId} />
}
export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/issues/$itemId"
)({ component: IssueRoute })
