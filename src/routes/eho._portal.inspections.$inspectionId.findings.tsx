import { createFileRoute } from "@tanstack/react-router"
import { EhoFindingsPage } from "@/features/eho/eho-follow-up-pages"

function FindingsRoute() {
  const { inspectionId } = Route.useParams()
  return <EhoFindingsPage inspectionId={inspectionId} />
}

export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/findings"
)({ component: FindingsRoute })
