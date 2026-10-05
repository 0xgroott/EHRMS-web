import { PremisesInspectionTable } from "@/components/shared/premises-inspection-table"
import type { InspectionHistoryEntry } from "./eho-inspection-history"

export function EhoInspectionHistoryPanel({
  entries,
}: {
  entries: InspectionHistoryEntry[]
}) {
  return <PremisesInspectionTable entries={entries} />
}
