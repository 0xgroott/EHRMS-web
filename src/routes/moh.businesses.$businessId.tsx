import { createFileRoute } from "@tanstack/react-router"
import { MohBusinessReviewPage } from "@/features/moh/moh-pages"

function MohBusinessRoute() {
  const { businessId } = Route.useParams()
  return <MohBusinessReviewPage submissionId={businessId} />
}

export const Route = createFileRoute("/moh/businesses/$businessId")({
  component: MohBusinessRoute,
})
