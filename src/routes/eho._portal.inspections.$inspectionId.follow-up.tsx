import { createFileRoute } from "@tanstack/react-router"
import { EhoFollowUpPage } from "@/features/eho/eho-follow-up-pages"

function FollowUpRoute() {
  const { inspectionId } = Route.useParams()
  return <EhoFollowUpPage inspectionId={inspectionId} />
}

export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/follow-up"
)({ component: FollowUpRoute })
