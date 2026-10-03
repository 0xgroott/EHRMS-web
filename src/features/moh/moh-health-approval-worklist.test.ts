import { describe, expect, it } from "vitest"
import { mohSubmissions } from "./moh-approvals"
import {
  filterAndSortHealthApprovalCases,
  mohHealthApprovalCases,
  scheduleHealthApprovalInspection,
  toDecisionCases,
} from "./moh-health-approval-worklist"

describe("MOH Health Approval pre-decision worklist", () => {
  it("seeds eligible and inspection cases and derives decision cases", () => {
    expect(
      mohHealthApprovalCases.filter((item) => item.stage === "eligible")
    ).toHaveLength(4)
    expect(
      mohHealthApprovalCases.filter((item) => item.stage === "inspection")
    ).toHaveLength(3)

    const decisions = toDecisionCases(mohSubmissions)
    expect(decisions).toHaveLength(12)
    expect(decisions[0]).toMatchObject({
      id: "HA-REV-001",
      stage: "decision",
      businessName: "Riverside Kitchen & Foods",
    })
  })

  it("filters by business, ward, and inspector and sorts by name", () => {
    expect(
      filterAndSortHealthApprovalCases(
        mohHealthApprovalCases,
        "Nwankwo",
        "newest"
      )
    ).toHaveLength(1)
    expect(
      filterAndSortHealthApprovalCases(
        mohHealthApprovalCases,
        "Diobu",
        "newest"
      ).every((item) => item.ward === "Diobu")
    ).toBe(true)
    expect(
      filterAndSortHealthApprovalCases(
        mohHealthApprovalCases,
        "",
        "business-asc"
      )[0].businessName
    ).toBe("Abonnema Wharf Canteen")
  })

  it("requires an inspector and a present-or-future inspection date", () => {
    const eligible = mohHealthApprovalCases.find(
      (item) => item.stage === "eligible"
    )!

    expect(() =>
      scheduleHealthApprovalInspection(
        eligible,
        { officer: "", scheduledAt: "2026-10-06" },
        "2026-09-30"
      )
    ).toThrow("Choose an Environmental Health Officer.")
    expect(() =>
      scheduleHealthApprovalInspection(
        eligible,
        { officer: "Ngozi Nwankwo", scheduledAt: "2026-09-29" },
        "2026-09-30"
      )
    ).toThrow("Choose today or a future date.")
  })

  it("moves an eligible premises into inspection tracking", () => {
    const eligible = mohHealthApprovalCases.find(
      (item) => item.stage === "eligible"
    )!
    const scheduled = scheduleHealthApprovalInspection(
      eligible,
      { officer: "Ngozi Nwankwo", scheduledAt: "2026-10-06" },
      "2026-09-30"
    )

    expect(scheduled).toMatchObject({
      id: eligible.id,
      stage: "inspection",
      inspection: {
        officer: "Ngozi Nwankwo",
        scheduledAt: "2026-10-06",
        status: "notice-served",
      },
    })
    expect(scheduled.inspection?.reference).toMatch(/^INS-HA-/)
  })
})
