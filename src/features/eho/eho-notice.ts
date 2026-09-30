import type { Assignment } from "./eho-model"

export interface InspectionNotice {
  assignmentId: string
  reference: string
  issuedAt: string
  servedAt?: string
  acknowledgedAt?: string
}

// Fictional notice metadata for the assigned inspection fixtures.
export const inspectionNotices: Partial<Record<string, InspectionNotice>> = {
  "EIN-101": {
    assignmentId: "EIN-101",
    reference: "NTC-101",
    issuedAt: "2026-09-16",
    servedAt: "2026-09-17",
    acknowledgedAt: "2026-09-18",
  },
  "EIN-102": {
    assignmentId: "EIN-102",
    reference: "NTC-102",
    issuedAt: "2026-09-19",
  },
  "EIN-103": {
    assignmentId: "EIN-103",
    reference: "NTC-103",
    issuedAt: "2026-09-15",
    servedAt: "2026-09-16",
    acknowledgedAt: "2026-09-17",
  },
  "EIN-104": {
    assignmentId: "EIN-104",
    reference: "NTC-104",
    issuedAt: "2026-09-05",
    servedAt: "2026-09-06",
    acknowledgedAt: "2026-09-07",
  },
  "EIN-105": {
    assignmentId: "EIN-105",
    reference: "NTC-105",
    issuedAt: "2026-09-26",
  },
}

export function noticeFor(assignment: Assignment): InspectionNotice | null {
  const notice = inspectionNotices[assignment.id]
  if (!notice || notice.assignmentId !== assignment.id) return null
  if (assignment.notice === "Served" && !notice.servedAt) return null
  if (
    assignment.notice === "Not served" &&
    (notice.servedAt || notice.acknowledgedAt)
  )
    return null
  return notice
}
