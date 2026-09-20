import { createFileRoute } from "@tanstack/react-router"
import { EhoResultPage } from "@/features/eho/eho-inspection-pages"

function ResultRoute() {
  const { inspectionId } = Route.useParams()
  return <EhoResultPage inspectionId={inspectionId} />
}
export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/result"
)({ component: ResultRoute })
