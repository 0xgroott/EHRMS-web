import { createFileRoute } from "@tanstack/react-router"
import { LgaApprovalDetail } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/health-approvals_/$caseId")({
  component: Page,
})
function Page() {
  const { caseId } = Route.useParams()
  return <LgaApprovalDetail caseId={caseId} />
}
