import { describe, expect, it } from "vitest"
import { initialFieldwork, createDraft, saveIssue } from "./eho-state"
import { assignments } from "./eho-model"
import { capturedPremisesFindings } from "./eho-premises-findings"

describe("EHO premises findings", () => {
  it("shows saved issues only for the selected premises", () => {
    const records = initialFieldwork()
    expect(capturedPremisesFindings("PR-004", records)).toEqual([
      expect.objectContaining({
        inspectionId: "EIN-104",
        description:
          "Waste bins were left uncovered near the preparation area.",
        action: "Provide covered bins and keep a daily disposal record.",
        deadline: "2026-09-18",
        status: "Captured",
      }),
    ])
    expect(capturedPremisesFindings("PR-001", records)).toEqual([])
  })

  it("does not present draft issues as completed findings", () => {
    const draft = saveIssue(createDraft(assignments[0]), {
      id: "ISS-DRAFT-1",
      itemId: "food-storage",
      description: "Open sacks",
      action: "Store in sealed containers",
      deadline: "2026-10-01",
      notes: "",
    })
    expect(capturedPremisesFindings("PR-002", { "EIN-101": draft })).toEqual([])
  })

  it("marks findings from a queued inspection as local", () => {
    const completed = initialFieldwork()["EIN-104"]!
    expect(
      capturedPremisesFindings("PR-004", {
        "EIN-104": { ...completed, status: "queued" },
      })[0]?.status
    ).toBe("Queued locally")
  })
})
