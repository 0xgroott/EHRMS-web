import { describe, expect, it } from "vitest"
import type { Fieldwork } from "./eho-model"
import type { InspectionTaskProgress } from "./eho-task-progress"
import { inspectionJourney } from "./eho-inspection-journey"

const inspectionId = "EIN-101"

function draft(overrides: Partial<Fieldwork> = {}): Fieldwork {
  return {
    assignmentId: inspectionId,
    status: "draft",
    answers: {},
    notes: {},
    issues: [],
    attendingOfficers: ["Ebi Briggs"],
    ...overrides,
  }
}

function progress(
  overrides: Partial<InspectionTaskProgress> = {}
): InspectionTaskProgress {
  return { assignmentId: inspectionId, ...overrides }
}

describe("EHO inspection journey", () => {
  it("starts with food storage and locks later checks", () => {
    const journey = inspectionJourney({
      inspectionId,
      pathname: `/eho/inspections/${inspectionId}/checklist`,
      progress: progress(),
      draft: draft(),
      followUpRequired: false,
      followUpCompleted: false,
    })

    expect(journey.active.id).toBe("food-storage")
    expect(journey.completedCount).toBe(0)
    expect(journey.steps[0].href).toBe(
      `/eho/inspections/${inspectionId}/checklist`
    )
    expect(journey.steps[0].label).toBe("Food storage")
    expect(journey.steps[1].href).toBeUndefined()
    expect(journey.guidance).toMatch(/food storage/i)
  })

  it("opens each next check after the preceding assessment is complete", () => {
    const startedDraft = draft({
      answers: {
        "food-storage": "Satisfactory",
      },
    })
    const journey = inspectionJourney({
      inspectionId,
      pathname: `/eho/inspections/${inspectionId}/checklist/waste-control`,
      progress: progress(),
      draft: startedDraft,
      followUpRequired: false,
      followUpCompleted: false,
    })

    expect(journey.active.id).toBe("waste-control")
    expect(
      journey.steps.find((step) => step.id === "food-storage")?.status
    ).toBe("complete")
    expect(journey.steps.find((step) => step.id === "water-supply")?.href).toBe(
      undefined
    )
  })

  it("shows findings as the next stage after a submitted contravention", () => {
    const submitted = draft({
      status: "submitted",
      submittedAt: "2026-09-29T10:00:00.000Z",
      issues: [
        {
          id: "issue-1",
          itemId: "food-storage",
          description: "Unsafe temperature",
          action: "Repair cold storage",
          deadline: "2026-10-03",
          notes: "",
        },
      ],
    })
    const journey = inspectionJourney({
      inspectionId,
      pathname: `/eho/inspections/${inspectionId}/findings`,
      progress: progress(),
      draft: submitted,
      followUpRequired: true,
      followUpCompleted: false,
    })

    expect(journey.active.id).toBe("resolve")
    expect(journey.steps.find((step) => step.id === "submit")?.status).toBe(
      "complete"
    )
    expect(journey.steps.find((step) => step.id === "resolve")?.href).toBe(
      `/eho/inspections/${inspectionId}/findings`
    )
    expect(journey.guidance).toMatch(/follow-up/i)
  })

  it("skips findings when none exist and completes the closed task", () => {
    const journey = inspectionJourney({
      inspectionId,
      pathname: `/eho/inspections/${inspectionId}/result`,
      progress: progress({ completedAt: "2026-09-29T12:00:00.000Z" }),
      draft: draft({
        status: "submitted",
        submittedAt: "2026-09-29T10:00:00.000Z",
      }),
      followUpRequired: false,
      followUpCompleted: false,
    })

    expect(journey.completedCount).toBe(7)
    expect(journey.guidance).toMatch(/closed/i)
  })
})
