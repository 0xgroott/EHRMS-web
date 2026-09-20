import type { Premises } from "@/domain/types"
import { assignments } from "./eho-model"
import type { Fieldwork } from "./eho-model"

export interface InspectionHistoryEntry {
  id: string
  type: string
  date: string
  status: "Completed" | "Queued locally"
  officer: string
  findings: number | null
  href?: string
}

export function inspectionHistory(
  premises: Premises,
  fieldwork: Partial<Record<string, Fieldwork>>,
  today: string
): InspectionHistoryEntry[] {
  const local = assignments.flatMap((assignment) => {
    if (assignment.premisesId !== premises.id) return []
    const record = fieldwork[assignment.id]
    if (!record || record.status === "draft" || !record.submittedAt) return []
    return [
      {
        id: assignment.id,
        type: assignment.type,
        date: record.submittedAt.slice(0, 10),
        status:
          record.status === "queued"
            ? ("Queued locally" as const)
            : ("Completed" as const),
        officer: record.attendingOfficers.join(", "),
        findings: record.issues.length,
        href: `/eho/inspections/${encodeURIComponent(assignment.id)}/result`,
      },
    ]
  })
  const recorded = premises.inspections
    .filter(
      (visit) =>
        visit.status === "Completed" &&
        visit.scheduledAt <= today &&
        !local.some((item) => item.id === visit.id)
    )
    .map((visit) => ({
      id: visit.id,
      type: visit.type,
      date: visit.scheduledAt,
      status: "Completed" as const,
      officer: visit.officer,
      findings: null,
    }))
  return [...local, ...recorded].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)
  )
}
