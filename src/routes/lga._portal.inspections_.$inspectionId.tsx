import { createFileRoute } from "@tanstack/react-router"
import { LgaInspectionDetail } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/inspections_/$inspectionId")(
  { component: Page }
)
function Page() {
  const { inspectionId } = Route.useParams()
  return <LgaInspectionDetail inspectionId={inspectionId} />
}
