export interface ProviderReport {
  submittedAt: string
  areas: string[]
  pests: string[]
  methods: string[]
  notes: string
  evidence: string[]
}

export interface FumigationJob {
  id: string
  officerId: string
  premisesId: string
  provider: string
  scheduledAt: string
  status: "Completed" | "Scheduled" | "Rescheduled" | "Cancelled"
  report?: ProviderReport
}

export type ReviewStatus = "draft" | "confirmed" | "disputed"
export interface FumigationReview {
  jobId: string
  status: ReviewStatus
  attended: boolean
  note: string
  evidenceReference: string
  reviewedAt?: string
}

export const fumigationJobs: FumigationJob[] = [
  {
    id: "FUM-201",
    officerId: "EHO-001",
    premisesId: "PR-001",
    provider: "Harbour Environmental Services",
    scheduledAt: "2026-09-18 · 09:00",
    status: "Completed",
    report: {
      submittedAt: "2026-09-18 · 16:40",
      areas: ["Kitchen", "Dry store", "Waste holding area"],
      pests: ["Cockroaches", "Rodents"],
      methods: ["Targeted gel bait", "Rodent bait stations"],
      notes:
        "Kitchen preparation surfaces were protected during treatment. Follow-up monitoring advised in 14 days.",
      evidence: ["Treatment log · FUM-201-A", "Site photographs · FUM-201-B"],
    },
  },
  {
    id: "FUM-202",
    officerId: "EHO-001",
    premisesId: "PR-004",
    provider: "Delta Pest Control",
    scheduledAt: "2026-09-23 · 10:30",
    status: "Scheduled",
  },
  {
    id: "FUM-203",
    officerId: "EHO-001",
    premisesId: "PR-002",
    provider: "Harbour Environmental Services",
    scheduledAt: "2026-09-26 · 11:00",
    status: "Rescheduled",
  },
]

export function blankReview(jobId: string): FumigationReview {
  return {
    jobId,
    status: "draft",
    attended: false,
    note: "",
    evidenceReference: "",
  }
}

export function reviewError(
  job: FumigationJob,
  review: FumigationReview,
  decision: "confirmed" | "disputed"
): string | null {
  if (review.status !== "draft") return "This report has already been reviewed."
  if (job.status !== "Completed" || !job.report)
    return "Wait for the provider to submit a completed job report."
  const report = job.report
  if (
    !report.areas.length ||
    !report.pests.length ||
    !report.methods.length ||
    !report.notes.trim()
  )
    return "The provider report is incomplete. Request the missing details before reviewing it."
  if (decision === "confirmed" && !review.attended)
    return "Confirm attendance before confirming the provider report."
  if (decision === "disputed" && !review.note.trim())
    return "Describe what differs from the provider report."
  return null
}

export function decideReview(
  job: FumigationJob,
  review: FumigationReview,
  decision: "confirmed" | "disputed",
  now: string
): FumigationReview {
  const error = reviewError(job, review, decision)
  if (error) throw new Error(error)
  return {
    ...review,
    note: review.note.trim(),
    evidenceReference: review.evidenceReference.trim(),
    status: decision,
    reviewedAt: now,
  }
}

type StorageReader = Pick<Storage, "getItem">
type StorageWriter = Pick<Storage, "setItem">
const key = (officerId: string, jobId: string) =>
  `ehrcms:eho:fumigation:v1:${officerId}:${jobId}`

export function readReview(
  storage: StorageReader,
  officerId: string,
  jobId: string
): FumigationReview {
  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(key(officerId, jobId)) ?? "null"
    )
    if (!parsed || typeof parsed !== "object") return blankReview(jobId)
    const review = parsed as Partial<FumigationReview>
    if (
      review.jobId !== jobId ||
      !["draft", "confirmed", "disputed"].includes(review.status ?? "") ||
      typeof review.attended !== "boolean" ||
      typeof review.note !== "string" ||
      typeof review.evidenceReference !== "string"
    )
      return blankReview(jobId)
    return {
      jobId,
      status: review.status!,
      attended: review.attended,
      note: review.note,
      evidenceReference: review.evidenceReference,
      reviewedAt:
        typeof review.reviewedAt === "string" ? review.reviewedAt : undefined,
    }
  } catch {
    return blankReview(jobId)
  }
}

export function saveReview(
  storage: StorageWriter,
  officerId: string,
  review: FumigationReview
) {
  storage.setItem(key(officerId, review.jobId), JSON.stringify(review))
}
