import type { LgaFilters } from "./lga-data"

export function validateFinanceSearch(
  search: Record<string, unknown>
): LgaFilters {
  const date = (value: unknown) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return undefined
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
      ? value
      : undefined
  }
  return {
    ward:
      typeof search.ward === "string" && search.ward !== "all"
        ? search.ward
        : undefined,
    service:
      search.service === "Fitness" || search.service === "Fumigation"
        ? search.service
        : undefined,
    from: date(search.from),
    to: date(search.to),
  }
}
