import { describe, expect, it } from "vitest"
import {
  canStart,
  claimAssignment,
  createDraft,
  initialFieldwork,
  readFieldwork,
  removeLegacyDefaultAnswer,
  reviewErrors,
  saveAnswer,
  saveFieldwork,
  saveIssue,
  signInOfficer,
  submitInspection,
} from "./eho-state"
import { assignments } from "./eho-model"

describe("assigned EHO fieldwork", () => {
  it("starts a new inspection without a selected assessment", () => {
    expect(initialFieldwork()["EIN-103"]).toBeUndefined()
    const legacy = saveAnswer(
      createDraft(assignments[2]),
      "food-storage",
      "Satisfactory"
    )
    expect(
      removeLegacyDefaultAnswer({ [legacy.assignmentId]: legacy })[
        legacy.assignmentId
      ]?.answers
    ).toEqual({})
  })

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

  it("allows fieldwork after an originally unserved notice is recorded as served", () => {
    const draft = createDraft(assignments[1])
    expect(canStart(assignments[1], true)).toBe(true)
    expect(
      saveAnswer(draft, "food-storage", "Satisfactory", true).answers[
        "food-storage"
      ]
    ).toBe("Satisfactory")
  })

  it("claims an open inspection as a draft for the current officer", () => {
    const existing = { [assignments[2].id]: createDraft(assignments[2]) }
    const claimed = claimAssignment(existing, assignments[0], "Ebi Briggs")

    expect(claimed[assignments[0].id]).toMatchObject({
      assignmentId: assignments[0].id,
      status: "draft",
      attendingOfficers: ["Ebi Briggs"],
    })
    expect(claimed[assignments[2].id]).toEqual(existing[assignments[2].id])
    expect(claimAssignment(claimed, assignments[0], "Ebi Briggs")).toBe(claimed)
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

  it("restores multiple evidence files and migrates a legacy single file", () => {
    const draft = saveIssue(createDraft(assignments[0]), {
      id: "issue-evidence",
      itemId: "food-storage",
      description: "Cold storage failure",
      action: "Repair and verify the cold room",
      deadline: "2026-10-03",
      notes: "",
      evidence: [
        { name: "cold-room.jpg", type: "image/jpeg", size: 1200 },
        { name: "temperature.mp4", type: "video/mp4", size: 2400 },
      ],
    })
    const storage = new Map<string, string>()
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    }
    saveFieldwork(adapter, "EHO-001", { [draft.assignmentId]: draft })
    expect(
      readFieldwork(adapter, "EHO-001")[draft.assignmentId]?.issues[0].evidence
    ).toHaveLength(2)

    storage.set(
      "ehrcms:eho:fieldwork:v1:EHO-001",
      JSON.stringify({
        [draft.assignmentId]: {
          ...draft,
          issues: [
            {
              ...draft.issues[0],
              evidence: {
                name: "legacy-photo.jpg",
                type: "image/jpeg",
                size: 800,
              },
            },
          ],
        },
      })
    )
    expect(
      readFieldwork(adapter, "EHO-001")[draft.assignmentId]?.issues[0].evidence
    ).toEqual([{ name: "legacy-photo.jpg", type: "image/jpeg", size: 800 }])
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
