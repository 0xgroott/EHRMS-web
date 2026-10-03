import type { MohSubmission } from "./moh-approvals"

export type HealthApprovalWorkStage = "eligible" | "inspection" | "decision"

export type HealthApprovalCaseSort =
  "newest" | "oldest" | "business-asc" | "business-desc"

export type HealthApprovalInspectionStatus =
  "notice-served" | "acknowledged" | "scheduled" | "in-progress"

export interface HealthApprovalRequirement {
  reference: string
  status: "valid"
  detail: string
  expiresAt: string
}

export interface HealthApprovalInspection {
  reference: string
  officer: string
  scheduledAt: string
  status: HealthApprovalInspectionStatus
  noticeServedAt: string
  acknowledgedAt?: string
}

export interface HealthApprovalWorkCase {
  id: string
  premisesId: string
  businessName: string
  tradingName: string
  businessType: string
  address: string
  ward: string
  stage: HealthApprovalWorkStage
  stageDate: string
  fitness: HealthApprovalRequirement
  fumigation: HealthApprovalRequirement
  councilConditions: string[]
  previousInspection: {
    completedAt: string
    officer: string
    outcome: string
  }
  existingApproval?: {
    number: string
    status: "Expired" | "Expiring soon"
    expiresAt: string
  }
  inspection?: HealthApprovalInspection
  decisionSubmissionId?: string
}

const baseRequirements = (index: number) => ({
  fitness: {
    reference: `FIT-2026-${321 + index}`,
    status: "valid" as const,
    detail: `${8 + index} of ${8 + index} food handlers certified`,
    expiresAt: "2027-03-31",
  },
  fumigation: {
    reference: `FUM-2026-${901 + index}`,
    status: "valid" as const,
    detail: "Licensed provider report confirmed",
    expiresAt: "2027-04-15",
  },
  councilConditions: [
    "Business registration is active",
    "No unresolved compliance hold",
  ],
})

const seedBusinesses = [
  {
    id: "HA-WORK-001",
    premisesId: "PR-021",
    businessName: "Abonnema Wharf Canteen",
    tradingName: "Wharf Canteen",
    businessType: "Restaurant",
    address: "28 Abonnema Wharf Road, Diobu",
    ward: "Diobu",
    stage: "eligible" as const,
    stageDate: "2026-09-30",
    previousInspection: {
      completedAt: "2025-09-18",
      officer: "Ebi Briggs",
      outcome: "Compliant after correction",
    },
    existingApproval: {
      number: "HAC-2025-0142",
      status: "Expired" as const,
      expiresAt: "2026-09-18",
    },
  },
  {
    id: "HA-WORK-002",
    premisesId: "PR-022",
    businessName: "Elekahia Catering House",
    tradingName: "Elekahia Catering",
    businessType: "Catering service",
    address: "11 Elekahia Road, Elekahia",
    ward: "Elekahia",
    stage: "eligible" as const,
    stageDate: "2026-09-29",
    previousInspection: {
      completedAt: "2025-10-03",
      officer: "Tamuno George",
      outcome: "Approved",
    },
  },
  {
    id: "HA-WORK-003",
    premisesId: "PR-023",
    businessName: "Oroworukwo Mini Mart",
    tradingName: "Oroworukwo Mart",
    businessType: "Supermarket",
    address: "6 Ikwerre Road, Oroworukwo",
    ward: "Oroworukwo",
    stage: "eligible" as const,
    stageDate: "2026-09-28",
    previousInspection: {
      completedAt: "2025-08-12",
      officer: "Ngozi Nwankwo",
      outcome: "Approved",
    },
  },
  {
    id: "HA-WORK-004",
    premisesId: "PR-024",
    businessName: "New GRA Lodgings",
    tradingName: "GRA Lodgings",
    businessType: "Hotel",
    address: "14 Tombia Street, New GRA",
    ward: "New GRA",
    stage: "eligible" as const,
    stageDate: "2026-09-27",
    previousInspection: {
      completedAt: "2025-09-01",
      officer: "Ibiso Jack",
      outcome: "Approved with conditions",
    },
  },
  {
    id: "HA-WORK-005",
    premisesId: "PR-025",
    businessName: "Azikiwe Road Eatery",
    tradingName: "Azikiwe Eatery",
    businessType: "Restaurant",
    address: "42 Azikiwe Road, Mile Two",
    ward: "Diobu",
    stage: "inspection" as const,
    stageDate: "2026-09-30",
    previousInspection: {
      completedAt: "2025-09-22",
      officer: "Ebi Briggs",
      outcome: "Approved",
    },
    inspection: {
      reference: "INS-HA-2011",
      officer: "Ngozi Nwankwo",
      scheduledAt: "2026-10-08",
      status: "notice-served" as const,
      noticeServedAt: "2026-09-30T09:30:00.000Z",
    },
  },
  {
    id: "HA-WORK-006",
    premisesId: "PR-026",
    businessName: "Station Road Cold Room",
    tradingName: "Station Cold Room",
    businessType: "Cold store",
    address: "5 Station Road, Port Harcourt Township",
    ward: "Port Harcourt Township",
    stage: "inspection" as const,
    stageDate: "2026-09-28",
    previousInspection: {
      completedAt: "2025-08-29",
      officer: "Tamuno George",
      outcome: "Approved",
    },
    inspection: {
      reference: "INS-HA-2010",
      officer: "Ebi Briggs",
      scheduledAt: "2026-10-06",
      status: "acknowledged" as const,
      noticeServedAt: "2026-09-27T11:00:00.000Z",
      acknowledgedAt: "2026-09-28T08:15:00.000Z",
    },
  },
  {
    id: "HA-WORK-007",
    premisesId: "PR-027",
    businessName: "Rumuwoji Event Centre",
    tradingName: "Rumuwoji Events",
    businessType: "Event centre",
    address: "19 Rumuwoji Road, Mile One",
    ward: "Diobu",
    stage: "inspection" as const,
    stageDate: "2026-09-26",
    previousInspection: {
      completedAt: "2025-07-16",
      officer: "Ibiso Jack",
      outcome: "Approved after follow-up",
    },
    inspection: {
      reference: "INS-HA-2009",
      officer: "Tamuno George",
      scheduledAt: "2026-10-03",
      status: "scheduled" as const,
      noticeServedAt: "2026-09-24T10:20:00.000Z",
      acknowledgedAt: "2026-09-25T13:40:00.000Z",
    },
  },
]

export const mohHealthApprovalCases: HealthApprovalWorkCase[] =
  seedBusinesses.map((business, index) => ({
    ...business,
    ...baseRequirements(index),
  }))

export function toDecisionCases(
  submissions: MohSubmission[]
): HealthApprovalWorkCase[] {
  return submissions.map((submission) => ({
    id: submission.id,
    premisesId: submission.premisesId,
    businessName: submission.businessName,
    tradingName: submission.tradingName,
    businessType: submission.businessType,
    address: submission.address,
    ward: submission.ward,
    stage: "decision",
    stageDate: submission.inspection.completedAt,
    fitness: {
      reference: `${submission.fitnessCertificates.certifiedStaff} certified staff`,
      status: "valid",
      detail: `${submission.fitnessCertificates.certifiedStaff} of ${submission.fitnessCertificates.totalStaff} food handlers certified`,
      expiresAt: submission.fumigationCertificate.expiresAt,
    },
    fumigation: {
      reference: submission.fumigationCertificate.number,
      status: "valid",
      detail: "Fumigation Certificate is valid",
      expiresAt: submission.fumigationCertificate.expiresAt,
    },
    councilConditions: ["Completed EHO inspection received"],
    previousInspection: {
      completedAt: submission.inspection.completedAt,
      officer: submission.inspection.officer,
      outcome: submission.inspection.recommendation,
    },
    inspection: {
      reference: submission.inspection.reference,
      officer: submission.inspection.officer,
      scheduledAt: submission.inspection.completedAt,
      status: "in-progress",
      noticeServedAt: submission.inspection.completedAt,
      acknowledgedAt: submission.inspection.completedAt,
    },
    decisionSubmissionId: submission.id,
  }))
}

export function filterAndSortHealthApprovalCases(
  cases: HealthApprovalWorkCase[],
  query: string,
  sort: HealthApprovalCaseSort
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filtered = normalizedQuery
    ? cases.filter((item) =>
        [
          item.businessName,
          item.tradingName,
          item.businessType,
          item.address,
          item.ward,
          item.inspection?.officer ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      )
    : cases

  return [...filtered].sort((left, right) => {
    if (sort === "business-asc" || sort === "business-desc") {
      const direction = sort === "business-asc" ? 1 : -1
      return left.businessName.localeCompare(right.businessName) * direction
    }
    const direction = sort === "newest" ? -1 : 1
    return left.stageDate.localeCompare(right.stageDate) * direction
  })
}

export function scheduleHealthApprovalInspection(
  workCase: HealthApprovalWorkCase,
  input: { officer: string; scheduledAt: string },
  today = new Date().toISOString().slice(0, 10)
): HealthApprovalWorkCase {
  if (workCase.stage !== "eligible")
    throw new Error("Only an eligible premises can be scheduled.")
  if (!input.officer.trim())
    throw new Error("Choose an Environmental Health Officer.")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.scheduledAt))
    throw new Error("Choose a valid inspection date.")
  if (input.scheduledAt < today)
    throw new Error("Choose today or a future date.")

  return {
    ...workCase,
    stage: "inspection",
    stageDate: today,
    inspection: {
      reference: `INS-HA-${workCase.id.replace(/\D/g, "").padStart(4, "0")}`,
      officer: input.officer.trim(),
      scheduledAt: input.scheduledAt,
      status: "notice-served",
      noticeServedAt: `${today}T09:00:00.000Z`,
    },
  }
}

export function findHealthApprovalCase(
  cases: HealthApprovalWorkCase[],
  caseId: string
) {
  return cases.find((item) => item.id === caseId)
}
