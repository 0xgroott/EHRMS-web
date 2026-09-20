import { createFileRoute } from "@tanstack/react-router"
import { EhoReviewPage } from "@/features/eho/eho-inspection-pages"

function ReviewRoute() {
  const { inspectionId } = Route.useParams()
  return <EhoReviewPage inspectionId={inspectionId} />
}
export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/review"
)({ component: ReviewRoute })
