import { describe, expect, it } from "vitest"
import {
  canStart,
  createDraft,
  readFieldwork,
  reviewErrors,
  saveAnswer,
  saveFieldwork,
  saveIssue,
  signInOfficer,
  submitInspection,
} from "./eho-state"
import { assignments } from "./eho-model"

describe("assigned EHO fieldwork", () => {
  it("accepts only an active assigned account", () => {
    expect(signInOfficer("ebi.briggs@phc.gov.ng", "field-demo")?.id).toBe(
      "EHO-001"
    )
    expect(signInOfficer("EHO-001", "wrong")).toBeNull()
    expect(signInOfficer("EHO-002", "field-demo")).toBeNull()
  })

  it("blocks an inspection whose notice has not been served", () => {
    expect(canStart(assignments[0])).toBe(true)
    expect(canStart(assignments[1])).toBe(false)
    const blocked = createDraft(assignments[1])
    expect(saveAnswer(blocked, "food-storage", "Satisfactory")).toEqual(blocked)
    expect(() => submitInspection(blocked, false)).toThrow(/notice/i)
  })

  it("requires every answer and a complete corrective action for contraventions", () => {
    const draft = createDraft(assignments[0])
    expect(reviewErrors(draft).length).toBeGreaterThan(0)
    const marked = saveAnswer(draft, "food-storage", "Contravention")
    expect(reviewErrors(marked)).toContain(
      "Food storage needs a complete contravention."
    )
    const issue = saveIssue(marked, {
      id: "issue-1",
      itemId: "food-storage",
      description: "Open sacks",
      action: "Store in sealed containers",
      deadline: "2026-10-03",
      notes: "",
    })
    expect(reviewErrors(issue)).not.toContain(
      "Food storage needs a complete contravention."
    )
  })

  it("saves a draft and submits once after the checklist is complete", () => {
    const storage = new Map<string, string>()
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
    }
    let draft = createDraft(assignments[0])
    for (const id of ["food-storage", "waste-control", "water-supply"])
      draft = saveAnswer(draft, id, "Satisfactory")
    saveFieldwork(adapter, "EHO-001", { [draft.assignmentId]: draft })
    const restored = readFieldwork(adapter, "EHO-001")[draft.assignmentId]
    if (!restored) throw new Error("Draft did not restore")
    expect(restored.answers["water-supply"]).toBe("Satisfactory")
    const submitted = submitInspection(restored, false)
    expect(submitted.status).toBe("submitted")
    expect(submitInspection(submitted, true)).toEqual(submitted)
  })

  it("recovers from malformed storage and rejects incomplete submission", () => {
    const adapter = { getItem: () => "{broken", setItem: () => undefined }
    expect(readFieldwork(adapter, "EHO-001")).toEqual({})
    expect(() => submitInspection(createDraft(assignments[0]), false)).toThrow(
      "Complete the checklist"
    )
  })

  it("ignores a stored draft with invalid checklist values", () => {
    const invalid = {
      ...createDraft(assignments[0]),
      answers: { "food-storage": "Approved by council" },
    }
    const adapter = { getItem: () => JSON.stringify({ "EIN-101": invalid }) }
    expect(readFieldwork(adapter, "EHO-001")).toEqual({})
  })
})
