import { createFileRoute } from "@tanstack/react-router"
import { MohCertificatePage } from "@/features/moh/moh-pages"

function MohCertificateRoute() {
  const { businessId } = Route.useParams()
  return <MohCertificatePage submissionId={businessId} />
}

export const Route = createFileRoute(
  "/moh/businesses_/$businessId_/certificate"
)({ component: MohCertificateRoute })
