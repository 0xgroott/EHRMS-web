import { createFileRoute } from "@tanstack/react-router"
import { MohBusinessReviewPage } from "@/features/moh/moh-pages"

function MohHealthApprovalReviewRoute() {
  const { businessId } = Route.useParams()
  return <MohBusinessReviewPage submissionId={businessId} />
}

export const Route = createFileRoute("/moh/health-approvals_/$businessId")({
  component: MohHealthApprovalReviewRoute,
})
