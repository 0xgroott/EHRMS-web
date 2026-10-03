import { createFileRoute } from "@tanstack/react-router"
import { MohPremisesPage } from "@/features/moh/moh-pages"

function MohBusinessRoute() {
  const { businessId } = Route.useParams()
  return <MohPremisesPage premisesId={businessId} />
}

export const Route = createFileRoute("/moh/businesses_/$businessId")({
  component: MohBusinessRoute,
})
