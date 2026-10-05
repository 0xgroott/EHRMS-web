import { describe, expect, it } from "vitest"
import {
  getLgaReports,
  lgaReportRecords,
  findLgaReport,
  validateReportSearch,
} from "./lga-report-library"

describe("LGA report library", () => {
  it("restricts records to the assigned council before searching", () => {
    expect(getLgaReports(undefined, "revenue", "")).toEqual([])
    expect(getLgaReports("unknown", "revenue", "")).toEqual([])
    for (const category of ["revenue", "compliance", "performance"] as const) {
      const reports = getLgaReports("phc", category, "")
      expect(reports.length).toBeGreaterThan(0)
      expect(
        reports.every(
          (report) => report.councilId === "phc" && report.category === category
        )
      ).toBe(true)
      expect(reports.map((report) => report.uploadedAt)).toEqual(
        reports
          .map((report) => report.uploadedAt)
          .sort()
          .reverse()
      )
    }
  })
  it("rejects foreign and missing document IDs and validates URL inputs", () => {
    expect(findLgaReport("phc", "foreign-report")).toBeUndefined()
    expect(findLgaReport("phc", "missing")).toBeUndefined()
    expect(findLgaReport(undefined, "phc-revenue-2026-09")).toBeUndefined()
    expect(findLgaReport("phc", "phc-revenue-2026-09")?.councilId).toBe("phc")
    expect(
      validateReportSearch({ category: "unknown", q: [], report: 123 })
    ).toEqual({ category: "revenue", q: "", report: undefined })
  })
  it("searches report titles without changing document contents", () => {
    const reports = getLgaReports("phc", "revenue", "  SEPTEMBER  ")
    expect(reports).toHaveLength(1)
    expect(reports[0].title).toContain("September")
    expect(reports[0].content).toContain(reports[0].title)
    expect(getLgaReports("phc", "revenue", "does not exist")).toEqual([])
    expect(
      lgaReportRecords.every(
        (report) =>
          report.preparedBy &&
          report.ward &&
          report.content &&
          report.filename.endsWith(".txt")
      )
    ).toBe(true)
  })
})
