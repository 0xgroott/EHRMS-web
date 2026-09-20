import { describe, expect, it } from "vitest"
import { assignments } from "./eho-model"
import { noticeFor } from "./eho-notice"

describe("EHO inspection notice records", () => {
  it("keeps notice service metadata aligned with each assigned inspection", () => {
    for (const assignment of assignments) {
      const notice = noticeFor(assignment)
      expect(notice?.assignmentId).toBe(assignment.id)
      expect(!!notice?.servedAt).toBe(assignment.notice === "Served")
      if (assignment.notice === "Not served")
        expect(notice?.acknowledgedAt).toBeUndefined()
    }
  })

  it("does not present inconsistent service data as a valid notice", () => {
    expect(noticeFor({ ...assignments[0], notice: "Not served" })).toBeNull()
    expect(noticeFor({ ...assignments[1], notice: "Served" })).toBeNull()
  })
})
