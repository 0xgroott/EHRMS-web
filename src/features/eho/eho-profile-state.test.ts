import { describe, expect, it } from "vitest"
import { assignments } from "./eho-model"
import { createDraft, initialFieldwork } from "./eho-state"
import { blankReview, saveReview } from "./eho-fumigation"
import { createFollowUp, saveFollowUp } from "./eho-follow-up"
import { summarizeDeviceWork, syncMessage } from "./eho-profile-state"

describe("EHO device status", () => {
  it("counts saved work for the signed-in officer only", () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
    }
    saveReview(storage, "EHO-001", {
      ...blankReview("FUM-201"),
      note: "Checked provider log",
    })
    saveFollowUp(storage, "EHO-001", {
      ...createFollowUp("EIN-104"),
      verifications: {
        "ISS-EIN-104-1": { result: "Resolved", note: "Bins covered" },
      },
    })
    const fieldwork = initialFieldwork()
    fieldwork["EIN-103"] = createDraft(assignments[2])
    fieldwork["EIN-104"] = { ...fieldwork["EIN-104"]!, status: "queued" }
    expect(summarizeDeviceWork(storage, "EHO-001", fieldwork)).toEqual({
      inspectionDrafts: 1,
      queuedInspections: 1,
      savedFollowUps: 1,
      savedReportReviews: 1,
      savedRecords: 4,
    })
    expect(summarizeDeviceWork(storage, "EHO-002", {})).toEqual({
      inspectionDrafts: 0,
      queuedInspections: 0,
      savedFollowUps: 0,
      savedReportReviews: 0,
      savedRecords: 0,
    })
  })

  it("does not claim a successful sync in either connection state", () => {
    expect(syncMessage(true)).toMatch(/Unable to sync/)
    expect(syncMessage(false)).toMatch(/offline/)
  })
})
