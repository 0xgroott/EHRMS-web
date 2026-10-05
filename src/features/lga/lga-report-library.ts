export const reportCategories = [
  { value: "revenue", label: "Revenue" },
  { value: "compliance", label: "Compliance" },
  { value: "performance", label: "Service performance" },
] as const
export type ReportCategory = (typeof reportCategories)[number]["value"]
export interface LgaReport {
  id: string
  councilId: string
  category: ReportCategory
  title: string
  uploadedAt: string
  ward: string
  preparedBy: string
  filename: string
  content: string
}

// Fictional, immutable uploaded-document fixtures. The future document service must
// enforce council authorization for metadata, previews and downloads. No upload
// workflow or live report generation is implemented here.
const councilReports: LgaReport[] = reportCategories.flatMap(
  ({ value, label }) =>
    [
      {
        month: "September",
        date: "2026-10-05",
        period: "2026-09",
        ward: "Borokiri",
      },
      { month: "August", date: "2026-09-05", period: "2026-08", ward: "Diobu" },
    ].map(({ month, date, period, ward }) => {
      const title = `${label} report — ${month} 2026`
      const sections = {
        revenue:
          "Collections cover Fitness and Fumigation services within the reporting ward.\n\nReview outstanding settlements against the payment register and confirm receipts before closing the reporting period.",
        compliance:
          "Premises with open findings require follow-up by their assigned environmental health officer.\n\nPrioritise expired certificates and outstanding corrective actions. Record completed follow-ups in the premises register.",
        performance:
          "Review inspection completion and Health approval waiting times within the reporting ward.\n\nFollow up on overdue visits and pending decisions with the responsible officers. Track progress at the next council review.",
      }
      return {
        id: `phc-${value}-${period}`,
        councilId: "phc",
        category: value,
        title,
        uploadedAt: date,
        ward,
        preparedBy: "Dr. Nengi Alabo",
        filename: `phc-${value}-${period}.txt`,
        content: `${title}\nPort Harcourt City Council\n\nReporting period: ${month} 2026\nWard: ${ward}\nPrepared by: Dr. Nengi Alabo (MOH)\n\n${sections[value]}\n\nScope: premises and services in ${ward} ward, Port Harcourt City Council.`,
      }
    })
)

export const lgaReportRecords: LgaReport[] = [
  ...councilReports,
  {
    id: "foreign-report",
    councilId: "obi",
    category: "revenue",
    title: "Obio/Akpor revenue report — September 2026",
    uploadedAt: "2026-10-05",
    ward: "Rumuokoro",
    preparedBy: "Dr. Ada Okoro",
    filename: "obi-revenue-2026-09.txt",
    content:
      "Obio/Akpor Council\nRevenue report — September 2026\n\nWard: Rumuokoro\nPrepared by: Dr. Ada Okoro (MOH)\n\nScope: Rumuokoro ward, Obio/Akpor Council.",
  },
]

export function findLgaReport(councilId: string | undefined, id: string) {
  return lgaReportRecords.find(
    (report) => report.councilId === councilId && report.id === id
  )
}

export function getLgaReports(
  councilId: string | undefined,
  category: ReportCategory,
  query: string
) {
  const term = query.trim().toLowerCase()
  return lgaReportRecords
    .filter(
      (report) =>
        report.councilId === councilId &&
        report.category === category &&
        report.title.toLowerCase().includes(term)
    )
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}

export function validateReportSearch(search: Record<string, unknown>) {
  return {
    category: reportCategories.some((item) => item.value === search.category)
      ? (search.category as ReportCategory)
      : ("revenue" as ReportCategory),
    q: typeof search.q === "string" ? search.q : "",
    report: typeof search.report === "string" ? search.report : undefined,
  }
}
