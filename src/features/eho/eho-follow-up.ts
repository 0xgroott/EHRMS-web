import type { Fieldwork, Issue } from "./eho-model"

export const FOLLOW_UP_PROGRESS_EVENT = "ehrcms:eho-follow-up-progress"

export type Verification = "Resolved" | "Still outstanding" | "Unable to verify"
export type FollowUpStatus = "draft" | "completed"

export interface FollowUpRecord {
  sourceId: string
  status: FollowUpStatus
  verifications: Partial<Record<string, { result: Verification; note: string }>>
  newIssues: Issue[]
  completedAt?: string
}

export const followUpScenarios: Partial<
  Record<
    string,
    { notice: "Served" | "Not served"; scheduledAt: string; reference: string }
  >
> = {
  "EIN-104": {
    notice: "Served",
    scheduledAt: "2026-09-25",
    reference: "EIN-FU-104",
  },
}

export function createFollowUp(sourceId: string): FollowUpRecord {
  return {
    sourceId,
    status: "draft",
    verifications: {},
    newIssues: [],
  }
}

export function followUpErrors(
  record: FollowUpRecord,
  source: Fieldwork,
  noticeServed: boolean
): string[] {
  const errors: string[] = []
  if (source.status !== "submitted")
    errors.push("Submit the original inspection first.")
  if (!source.issues.length) errors.push("No contraventions require follow-up.")
  if (!noticeServed) errors.push("A follow-up notice must be served first.")
  for (const issue of source.issues) {
    if (!record.verifications[issue.id]?.result)
      errors.push(`Verify ${issue.description.replace(/[.!?]+$/, "")}.`)
  }
  for (const issue of record.newIssues) {
    if (!issue.description.trim() || !issue.action.trim() || !issue.deadline)
      errors.push("Complete every new contravention and deadline.")
  }
  return errors
}

export function completeFollowUp(
  record: FollowUpRecord,
  source: Fieldwork,
  noticeServed: boolean,
  now = new Date().toISOString()
): FollowUpRecord {
  if (record.status === "completed") return record
  const errors = followUpErrors(record, source, noticeServed)
  if (errors.length) throw new Error(errors[0])
  return { ...record, status: "completed", completedAt: now }
}

export function followUpOutcome(record: FollowUpRecord): string {
  if (record.status !== "completed") return "Verification in progress"
  const needsReview =
    record.newIssues.length > 0 ||
    Object.values(record.verifications).some(
      (verification) => verification?.result !== "Resolved"
    )
  return needsReview
    ? "Further council review needed"
    : "All prior issues verified locally"
}

function isRecord(value: unknown, sourceId: string): value is FollowUpRecord {
  if (!value || typeof value !== "object") return false
  const record = value as Partial<FollowUpRecord>
  return (
    record.sourceId === sourceId &&
    (record.status === "draft" || record.status === "completed") &&
    !!record.verifications &&
    typeof record.verifications === "object" &&
    !Array.isArray(record.verifications) &&
    Object.values(record.verifications as Record<string, unknown>).every(
      (entry) =>
        !!entry &&
        typeof entry === "object" &&
        "note" in entry &&
        "result" in entry &&
        typeof entry.note === "string" &&
        ["Resolved", "Still outstanding", "Unable to verify"].includes(
          String(entry.result)
        )
    ) &&
    Array.isArray(record.newIssues) &&
    record.newIssues.every(
      (issue) =>
        typeof issue.id === "string" &&
        typeof issue.itemId === "string" &&
        typeof issue.description === "string" &&
        typeof issue.action === "string" &&
        typeof issue.deadline === "string" &&
        typeof issue.notes === "string"
    ) &&
    (record.status === "draft" || typeof record.completedAt === "string")
  )
}

export function followUpStorageKey(officerId: string, sourceId: string) {
  return `ehrcms:eho:follow-up:v1:${officerId}:${sourceId}`
}

export function readFollowUp(
  storage: Pick<Storage, "getItem">,
  officerId: string,
  sourceId: string
): FollowUpRecord {
  try {
    const raw = storage.getItem(followUpStorageKey(officerId, sourceId))
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isRecord(parsed, sourceId) ? parsed : createFollowUp(sourceId)
  } catch {
    return createFollowUp(sourceId)
  }
}

export function saveFollowUp(
  storage: Pick<Storage, "setItem">,
  officerId: string,
  record: FollowUpRecord
) {
  storage.setItem(
    followUpStorageKey(officerId, record.sourceId),
    JSON.stringify(record)
  )
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent(FOLLOW_UP_PROGRESS_EVENT, { detail: record })
    )
}
