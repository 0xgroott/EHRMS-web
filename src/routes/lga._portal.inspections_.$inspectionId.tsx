import { validateInspectionSearch } from "@/features/lga/lga-inspection-filters"
import { createFileRoute } from "@tanstack/react-router"
import { LgaInspectionDetail } from "@/features/lga/lga-pages"

export const Route = createFileRoute("/lga/_portal/inspections_/$inspectionId")(
  { validateSearch: validateInspectionSearch, component: Page }
)
function Page() {
  const { inspectionId } = Route.useParams()
  return <LgaInspectionDetail inspectionId={inspectionId} />
}
