import { createFileRoute } from "@tanstack/react-router"
import { EhoNoticePage } from "@/features/eho/eho-notice-page"

function NoticeRoute() {
  const { inspectionId } = Route.useParams()
  return <EhoNoticePage inspectionId={inspectionId} />
}

export const Route = createFileRoute(
  "/eho/_portal/inspections/$inspectionId/notice"
)({ component: NoticeRoute })
