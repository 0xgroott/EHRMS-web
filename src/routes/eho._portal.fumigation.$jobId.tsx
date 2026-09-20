import { createFileRoute } from "@tanstack/react-router"
import { EhoFumigationDetailPage } from "@/features/eho/eho-fumigation-pages"

function FumigationDetailRoute() {
  const { jobId } = Route.useParams()
  return <EhoFumigationDetailPage jobId={jobId} />
}

export const Route = createFileRoute("/eho/_portal/fumigation/$jobId")({
  component: FumigationDetailRoute,
})
