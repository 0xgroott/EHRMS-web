import { describe, expect, it } from "vitest"
import {
  blankReview,
  decideReview,
  fumigationJobs,
  readReview,
  reviewError,
  saveReview,
} from "./eho-fumigation"

describe("EHO fumigation report review", () => {
  const completed = fumigationJobs[0]
  const scheduled = fumigationJobs[1]

  it("requires a completed report and attendance before confirmation", () => {
    expect(
      reviewError(scheduled, blankReview(scheduled.id), "confirmed")
    ).toMatch(/provider/i)
    expect(
      reviewError(completed, blankReview(completed.id), "confirmed")
    ).toMatch(/attendance/i)
    const confirmed = decideReview(
      completed,
      { ...blankReview(completed.id), attended: true },
      "confirmed",
      "2026-09-19T10:00:00.000Z"
    )
    expect(confirmed.status).toBe("confirmed")
    expect(() =>
      decideReview(completed, confirmed, "disputed", "2026-09-19T11:00:00.000Z")
    ).toThrow(/already/)
  })

  it("requires a reason for a dispute, including when the officer did not attend", () => {
    expect(
      reviewError(completed, blankReview(completed.id), "disputed")
    ).toMatch(/describe/i)
    const disputed = decideReview(
      completed,
      {
        ...blankReview(completed.id),
        note: "  I did not attend; the reported areas cannot be verified.  ",
      },
      "disputed",
      "2026-09-19T10:00:00.000Z"
    )
    expect(disputed.note).toBe(
      "I did not attend; the reported areas cannot be verified."
    )
  })

  it("scopes saved drafts to the officer and job and recovers from malformed storage", () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
    }
    const draft = {
      ...blankReview(completed.id),
      note: "Checked treatment log",
    }
    saveReview(storage, "EHO-001", draft)
    expect(readReview(storage, "EHO-001", completed.id).note).toBe(
      "Checked treatment log"
    )
    expect(readReview(storage, "EHO-002", completed.id)).toEqual(
      blankReview(completed.id)
    )
    expect(readReview(storage, "EHO-001", scheduled.id)).toEqual(
      blankReview(scheduled.id)
    )
    values.set("ehrcms:eho:fumigation:v1:EHO-001:FUM-201", "{broken")
    expect(readReview(storage, "EHO-001", completed.id)).toEqual(
      blankReview(completed.id)
    )
  })
})
