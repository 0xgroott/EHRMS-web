import { assignments, checklist } from "./eho-model"
import type { Fieldwork } from "./eho-model"

export interface CapturedPremisesFinding {
  id: string
  inspectionId: string
  checklistItem: string
  description: string
  action: string
  deadline: string
  status: "Captured" | "Queued locally"
}

export function capturedPremisesFindings(
  premisesId: string,
  fieldwork: Partial<Record<string, Fieldwork>>
): CapturedPremisesFinding[] {
  return assignments.flatMap((assignment) => {
    if (assignment.premisesId !== premisesId) return []
    const record = fieldwork[assignment.id]
    if (!record || record.status === "draft") return []
    return record.issues.map((issue) => ({
      id: issue.id,
      inspectionId: assignment.id,
      checklistItem:
        checklist.find((item) => item.id === issue.itemId)?.label ??
        "Inspection finding",
      description: issue.description,
      action: issue.action,
      deadline: issue.deadline,
      status:
        record.status === "queued"
          ? ("Queued locally" as const)
          : ("Captured" as const),
    }))
  })
}
