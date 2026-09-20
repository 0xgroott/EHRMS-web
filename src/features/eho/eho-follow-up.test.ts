import { describe, expect, it } from "vitest"
import { assignments } from "./eho-model"
import {
  createDraft,
  saveAnswer,
  saveIssue,
  submitInspection,
} from "./eho-state"
import {
  completeFollowUp,
  createFollowUp,
  followUpErrors,
  followUpOutcome,
  readFollowUp,
  saveFollowUp,
} from "./eho-follow-up"

function sourceInspection() {
  let draft = createDraft(assignments[0])
  for (const itemId of ["food-storage", "waste-control", "water-supply"])
    draft = saveAnswer(draft, itemId, "Satisfactory")
  draft = saveIssue(draft, {
    id: "issue-1",
    itemId: "waste-control",
    description: "Open waste bins",
    action: "Install covered bins",
    deadline: "2026-10-01",
    notes: "",
  })
  return submitInspection(draft, false)
}

describe("EHO follow-up", () => {
  it("requires a served notice and a result for every prior issue", () => {
    const source = sourceInspection()
    const record = createFollowUp(source.assignmentId)
    expect(followUpErrors(record, source, false)).toContain(
      "A follow-up notice must be served first."
    )
    expect(() => completeFollowUp(record, source, true)).toThrow(
      "Verify Open waste bins."
    )
  })

  it("persists a partial verification and completes only once", () => {
    const source = sourceInspection()
    const record = {
      ...createFollowUp(source.assignmentId),
      verifications: {
        "issue-1": {
          result: "Resolved" as const,
          note: "Covered bins in place",
        },
      },
    }
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
    }
    saveFollowUp(storage, "EHO-001", record)
    const restored = readFollowUp(storage, "EHO-001", source.assignmentId)
    expect(restored.verifications["issue-1"]?.note).toBe(
      "Covered bins in place"
    )
    const completed = completeFollowUp(restored, source, true, "2026-09-25")
    expect(followUpOutcome(completed)).toBe("All prior issues verified locally")
    expect(completeFollowUp(completed, source, true, "later")).toEqual(
      completed
    )
  })

  it("shows council review when an issue remains and recovers from corrupt storage", () => {
    const source = sourceInspection()
    const record = {
      ...createFollowUp(source.assignmentId),
      verifications: {
        "issue-1": { result: "Still outstanding" as const, note: "No covers" },
      },
    }
    expect(followUpOutcome(completeFollowUp(record, source, true))).toBe(
      "Further council review needed"
    )
    expect(
      readFollowUp({ getItem: () => "{bad" }, "EHO-001", source.assignmentId)
    ).toEqual(createFollowUp(source.assignmentId))
  })

  it("requires complete new issues and does not start from a queued result", () => {
    const source = sourceInspection()
    const record = {
      ...createFollowUp(source.assignmentId),
      verifications: {
        "issue-1": { result: "Resolved" as const, note: "Covered bins" },
      },
      newIssues: [
        {
          id: "new-1",
          itemId: "follow-up",
          description: "New pest activity",
          action: "",
          deadline: "",
          notes: "",
        },
      ],
    }
    expect(followUpErrors(record, source, true)).toContain(
      "Complete every new contravention and deadline."
    )
    expect(
      followUpErrors(record, { ...source, status: "queued" }, true)
    ).toContain("Submit the original inspection first.")
  })
})
