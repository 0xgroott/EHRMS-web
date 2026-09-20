import type { Fieldwork } from "./eho-model"
import { followUpScenarios, readFollowUp } from "./eho-follow-up"
import { fumigationJobs, readReview } from "./eho-fumigation"

export interface DeviceWorkSummary {
  inspectionDrafts: number
  queuedInspections: number
  savedFollowUps: number
  savedReportReviews: number
  savedRecords: number
}

export function summarizeDeviceWork(
  storage: Pick<Storage, "getItem">,
  officerId: string,
  fieldwork: Partial<Record<string, Fieldwork>>
): DeviceWorkSummary {
  const records = Object.values(fieldwork)
  const inspectionDrafts = records.filter(
    (record) => record?.status === "draft"
  ).length
  const queuedInspections = records.filter(
    (record) => record?.status === "queued"
  ).length
  const savedFollowUps = Object.keys(followUpScenarios).filter((sourceId) => {
    const record = readFollowUp(storage, officerId, sourceId)
    return (
      record.status === "completed" ||
      Object.keys(record.verifications).length > 0 ||
      record.newIssues.length > 0
    )
  }).length
  const savedReportReviews = fumigationJobs.filter((job) => {
    if (job.officerId !== officerId) return false
    const review = readReview(storage, officerId, job.id)
    return (
      review.status !== "draft" ||
      review.attended ||
      !!review.note.trim() ||
      !!review.evidenceReference.trim()
    )
  }).length
  return {
    inspectionDrafts,
    queuedInspections,
    savedFollowUps,
    savedReportReviews,
    savedRecords: records.length + savedFollowUps + savedReportReviews,
  }
}

export function syncMessage(online: boolean): string {
  return online
    ? "Unable to sync right now. Your work remains saved on this device."
    : "You’re offline. Reconnect and try again; your work remains saved on this device."
}
