import { filterLgaRows } from "./lga-data"
import type { LgaInspection } from "./lga-data"

export function validateInspectionSearch(search: Record<string, unknown>) {
  const date = (value: unknown) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : undefined
  return {
    q: typeof search.q === "string" ? search.q : "",
    status: typeof search.status === "string" ? search.status : "all",
    ward:
      typeof search.ward === "string" && search.ward !== "all"
        ? search.ward
        : undefined,
    from: date(search.from),
    to: date(search.to),
  }
}
export function isInspectionOverdue(
  inspection: LgaInspection,
  today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(
    new Date()
  )
) {
  return (
    ["Scheduled", "In progress"].includes(inspection.status) &&
    inspection.scheduledAt < today
  )
}
export function selectInspections(
  inspections: LgaInspection[],
  filters: ReturnType<typeof validateInspectionSearch>,
  today?: string
) {
  const query = filters.q.trim().toLowerCase()
  return filterLgaRows(inspections, filters, (item) => item.scheduledAt).filter(
    (item) =>
      (filters.status === "all" ||
        (filters.status === "Overdue"
          ? isInspectionOverdue(item, today)
          : item.status === filters.status)) &&
      `${item.businessName} ${item.id}`.toLowerCase().includes(query)
  )
}
export const formatInspectionDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))
