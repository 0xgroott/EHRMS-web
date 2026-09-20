import { createFileRoute } from "@tanstack/react-router"
import { EhoCompliancePage } from "@/features/eho/eho-pages"

function ComplianceRoute() {
  const { premisesId } = Route.useParams()
  return <EhoCompliancePage premisesId={premisesId} />
}
export const Route = createFileRoute("/eho/_portal/premises/$premisesId")({
  component: ComplianceRoute,
})
