import { expect, it } from "vitest"
import {
  isInspectionOverdue,
  selectInspections,
  validateInspectionSearch,
} from "./lga-inspection-filters"
import type { LgaInspection } from "./lga-data"

const item: LgaInspection = {
  id: "INS-1",
  premisesId: "PR-1",
  businessName: "River Kitchen",
  ward: "Diobu",
  status: "Scheduled",
  scheduledAt: "2026-09-22",
  type: "Routine inspection",
  officer: "Ebi Briggs",
  outstandingContraventions: 2,
}
it("flags past unfinished visits without flagging completed, cancelled or today's visits", () => {
  expect(isInspectionOverdue(item, "2026-10-05")).toBe(true)
  expect(isInspectionOverdue(item, "2026-09-22")).toBe(false)
  for (const status of ["Completed", "Cancelled"])
    expect(isInspectionOverdue({ ...item, status }, "2026-10-05")).toBe(false)
})
it("combines ward, status, date and trimmed reference/name search", () => {
  const filters = validateInspectionSearch({
    q: " ins-1 ",
    status: "Overdue",
    ward: "Diobu",
    from: "2026-09-01",
    to: "2026-09-30",
  })
  expect(selectInspections([item], filters, "2026-10-05")).toEqual([item])
  expect(
    selectInspections([item], { ...filters, ward: "Borokiri" }, "2026-10-05")
  ).toEqual([])
  expect(
    selectInspections([item], { ...filters, from: "2026-10-01" }, "2026-10-05")
  ).toEqual([])
  expect(
    selectInspections([item], validateInspectionSearch({ q: "river" }))
  ).toEqual([item])
  expect(selectInspections([item], validateInspectionSearch({}))).toEqual([
    item,
  ])
})
