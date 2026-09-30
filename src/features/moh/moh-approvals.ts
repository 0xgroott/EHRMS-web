export type HealthApprovalDecision =
  | { outcome: "approved"; decidedAt: string; certificateNumber: string }
  | { outcome: "denied"; decidedAt: string; reason: string }

export interface MohSubmission {
  id: string
  premisesId: string
  businessName: string
  tradingName: string
  businessType: string
  address: string
  ward: string
  inspection: {
    reference: string
    officer: string
    completedAt: string
    recommendation: string
  }
  fumigationCertificate: {
    number: string
    issuedAt: string
    expiresAt: string
  }
  fitnessCertificates: {
    certifiedStaff: number
    totalStaff: number
    latestIssuedAt: string
  }
}

export type MohSubmissionSort =
  "newest" | "oldest" | "business-asc" | "business-desc"

export const mohSubmissions: MohSubmission[] = [
  {
    id: "HA-REV-001",
    premisesId: "PR-001",
    businessName: "Riverside Kitchen & Foods",
    tradingName: "Riverside Kitchen",
    businessType: "Restaurant",
    address: "12 Abonnema Wharf Road, Diobu",
    ward: "Diobu",
    inspection: {
      reference: "INS-HA-1042",
      officer: "Tamuno George",
      completedAt: "2026-09-26",
      recommendation: "Recommended for approval",
    },
    fumigationCertificate: {
      number: "FUM-2026-0841",
      issuedAt: "2026-08-30",
      expiresAt: "2027-02-28",
    },
    fitnessCertificates: {
      certifiedStaff: 14,
      totalStaff: 14,
      latestIssuedAt: "2026-09-08",
    },
  },
  {
    id: "HA-REV-002",
    premisesId: "PR-004",
    businessName: "Creek View Bakery",
    tradingName: "Creek View",
    businessType: "Bakery",
    address: "21 Aggrey Road, Town",
    ward: "Town",
    inspection: {
      reference: "INS-HA-1048",
      officer: "Ebi Briggs",
      completedAt: "2026-09-28",
      recommendation: "Recommended for approval",
    },
    fumigationCertificate: {
      number: "FUM-2026-0866",
      issuedAt: "2026-09-02",
      expiresAt: "2027-03-02",
    },
    fitnessCertificates: {
      certifiedStaff: 9,
      totalStaff: 9,
      latestIssuedAt: "2026-09-19",
    },
  },
  ...[
    {
      id: "HA-REV-003",
      premisesId: "PR-002",
      businessName: "Trans-Amadi Food Court",
      tradingName: "TA Food Court",
      businessType: "Food Court",
      address: "45 Trans-Amadi Road, Oginigba",
      ward: "Oginigba",
      officer: "Tamuno George",
      completedAt: "2026-09-25",
      staff: 22,
    },
    {
      id: "HA-REV-004",
      premisesId: "PR-003",
      businessName: "Garden City Cold Stores",
      tradingName: "Garden City Cold Stores",
      businessType: "Cold Store",
      address: "8 Olu Obasanjo Road, D-Line",
      ward: "D-Line",
      officer: "Ebi Briggs",
      completedAt: "2026-09-15",
      staff: 11,
    },
    {
      id: "HA-REV-005",
      premisesId: "PR-013",
      businessName: "Harbour View Guest House",
      tradingName: "Harbour View",
      businessType: "Hotel",
      address: "9 Forces Avenue, Old GRA",
      ward: "Old GRA",
      officer: "Nneka Wali",
      completedAt: "2026-09-24",
      staff: 18,
    },
    {
      id: "HA-REV-006",
      premisesId: "PR-014",
      businessName: "Mile One Fresh Market",
      tradingName: "Mile One Market",
      businessType: "Market",
      address: "26 Ikwerre Road, Diobu",
      ward: "Diobu",
      officer: "Tamuno George",
      completedAt: "2026-09-23",
      staff: 31,
    },
    {
      id: "HA-REV-007",
      premisesId: "PR-015",
      businessName: "Borokiri Community Clinic",
      tradingName: "Borokiri Clinic",
      businessType: "Clinic",
      address: "4 Harold Wilson Drive, Borokiri",
      ward: "Borokiri",
      officer: "Ibiso Jack",
      completedAt: "2026-09-22",
      staff: 16,
    },
    {
      id: "HA-REV-008",
      premisesId: "PR-016",
      businessName: "King Jaja Event Hall",
      tradingName: "King Jaja Hall",
      businessType: "Event Centre",
      address: "18 King Jaja Street, Town",
      ward: "Town",
      officer: "Nneka Wali",
      completedAt: "2026-09-21",
      staff: 13,
    },
    {
      id: "HA-REV-009",
      premisesId: "PR-017",
      businessName: "Marine Base Eatery",
      tradingName: "Marine Base Eatery",
      businessType: "Restaurant",
      address: "31 Marine Base Road, Port Harcourt Township",
      ward: "Port Harcourt Township",
      officer: "Ebi Briggs",
      completedAt: "2026-09-20",
      staff: 12,
    },
    {
      id: "HA-REV-010",
      premisesId: "PR-018",
      businessName: "Bundu Cold Chain Depot",
      tradingName: "Bundu Cold Chain",
      businessType: "Cold Store",
      address: "6 Bundu Waterside Road, Bundu",
      ward: "Bundu",
      officer: "Ibiso Jack",
      completedAt: "2026-09-19",
      staff: 10,
    },
    {
      id: "HA-REV-011",
      premisesId: "PR-019",
      businessName: "Dockyard Foods",
      tradingName: "Dockyard Foods",
      businessType: "Restaurant",
      address: "10 Dockyard Road, Marine Base",
      ward: "Marine Base",
      officer: "Tamuno George",
      completedAt: "2026-09-18",
      staff: 15,
    },
    {
      id: "HA-REV-012",
      premisesId: "PR-020",
      businessName: "Old Township Grocers",
      tradingName: "Township Grocers",
      businessType: "Supermarket",
      address: "7 Hospital Road, Old Township",
      ward: "Old Township",
      officer: "Nneka Wali",
      completedAt: "2026-09-17",
      staff: 20,
    },
  ].map((business, index): MohSubmission => ({
    ...business,
    inspection: {
      reference: `INS-HA-${1051 + index}`,
      officer: business.officer,
      completedAt: business.completedAt,
      recommendation: "Recommended for approval",
    },
    fumigationCertificate: {
      number: `FUM-2026-${870 + index}`,
      issuedAt: "2026-09-01",
      expiresAt: "2027-03-01",
    },
    fitnessCertificates: {
      certifiedStaff: business.staff,
      totalStaff: business.staff,
      latestIssuedAt: business.completedAt,
    },
  })),
]

export function filterAndSortMohSubmissions(
  submissions: MohSubmission[],
  query: string,
  sort: MohSubmissionSort
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filtered = normalizedQuery
    ? submissions.filter((submission) =>
        [
          submission.businessName,
          submission.tradingName,
          submission.businessType,
          submission.address,
          submission.ward,
          submission.inspection.officer,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      )
    : submissions

  return [...filtered].sort((left, right) => {
    if (sort === "business-asc" || sort === "business-desc") {
      const direction = sort === "business-asc" ? 1 : -1
      return left.businessName.localeCompare(right.businessName) * direction
    }
    const direction = sort === "newest" ? -1 : 1
    return (
      left.inspection.completedAt.localeCompare(right.inspection.completedAt) *
      direction
    )
  })
}

export function findMohSubmission(id: string) {
  return mohSubmissions.find((submission) => submission.id === id)
}
