import { createFileRoute } from "@tanstack/react-router"
import { LgaPremisesDetail } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/premises_/$premisesId")({
  component: Page,
})
function Page() {
  const { premisesId } = Route.useParams()
  return <LgaPremisesDetail premisesId={premisesId} />
}
