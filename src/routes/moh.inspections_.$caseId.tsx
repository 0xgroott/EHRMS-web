import { createFileRoute } from "@tanstack/react-router"
import { MohInspectionCasePage } from "@/features/moh/moh-pages"

function MohInspectionCaseRoute() {
  const { caseId } = Route.useParams()
  return <MohInspectionCasePage caseId={caseId} />
}

export const Route = createFileRoute("/moh/inspections_/$caseId")({
  component: MohInspectionCaseRoute,
})
