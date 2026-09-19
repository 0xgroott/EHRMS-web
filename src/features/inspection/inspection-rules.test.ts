import { describe, expect, it } from "vitest"
import {
  acknowledgeInspectionNotice,
  acknowledgeFollowUpNotice,
  escalateInspection,
  issueHealthApproval,
  issueInspectionFindings,
  recordInspectionCorrection,
  resolveInspection,
  scheduleFollowUpNotice,
  scheduleInspectionNotice,
} from "./inspection-rules"

const details = { councilId: "phc", premisesName: "Riverside Kitchen" }

function scheduled() {
  const result = scheduleInspectionNotice(
    null,
    true,
    details,
    "2026-09-20T10:00:00.000Z"
  )
  if (!result.ok) throw new Error(result.error)
  return result.value
}

function findings() {
  const acknowledged = acknowledgeInspectionNotice(
    scheduled(),
    "2026-09-20T08:00:00.000Z"
  )
  if (!acknowledged.ok) throw new Error(acknowledged.error)
  const result = issueInspectionFindings(acknowledged.value)
  if (!result.ok) throw new Error(result.error)
  return result.value
}

function corrected() {
  const first = recordInspectionCorrection(
    findings(),
    "food-storage",
    "Sealed all dry goods"
  )
  if (!first.ok) throw new Error(first.error)
  const second = recordInspectionCorrection(
    first.value,
    "waste-control",
    "Replaced bins"
  )
  if (!second.ok) throw new Error(second.error)
  return second.value
}

describe("inspection transitions", () => {
  it("requires certificate eligibility and a registered premises before scheduling", () => {
    expect(scheduleInspectionNotice(null, false, details).ok).toBe(false)
    expect(
      scheduleInspectionNotice(null, true, { councilId: "", premisesName: "" })
        .ok
    ).toBe(false)
    expect(scheduleInspectionNotice(null, true, details).ok).toBe(true)
  })

  it("keeps notice, findings, and follow-up in order", () => {
    const notice = scheduled()
    expect(issueInspectionFindings(notice).ok).toBe(false)
    expect(acknowledgeInspectionNotice(notice).ok).toBe(true)
    const current = findings()
    expect(current.findings).toHaveLength(2)
    expect(current.findings.map((finding) => finding.id)).toEqual([
      "food-storage",
      "waste-control",
    ])
    expect(scheduleFollowUpNotice(current).ok).toBe(false)
    expect(resolveInspection(current).ok).toBe(false)
    const followUp = scheduleFollowUpNotice(corrected())
    expect(followUp.ok).toBe(true)
    if (!followUp.ok) return
    expect(followUp.value.followUpNotice?.reference).toContain("FOLLOW-UP")
    expect(
      Date.parse(followUp.value.followUpNotice?.scheduledAt ?? "")
    ).toBeGreaterThan(
      Math.max(
        ...followUp.value.findings.map((finding) =>
          Date.parse(finding.deadline)
        )
      )
    )
    expect(issueHealthApproval(followUp.value).ok).toBe(false)
    expect(acknowledgeFollowUpNotice(followUp.value).ok).toBe(true)
  })

  it("rejects blank or unknown correction notes", () => {
    expect(
      recordInspectionCorrection(findings(), "food-storage", "  ").ok
    ).toBe(false)
    expect(recordInspectionCorrection(findings(), "missing", "Done").ok).toBe(
      false
    )
  })

  it("issues an approval only after council resolution", () => {
    const followUp = scheduleFollowUpNotice(corrected())
    if (!followUp.ok) throw new Error(followUp.error)
    const acknowledged = acknowledgeFollowUpNotice(followUp.value)
    if (!acknowledged.ok) throw new Error(acknowledged.error)
    const resolved = resolveInspection(acknowledged.value)
    if (!resolved.ok) throw new Error(resolved.error)
    const issued = issueHealthApproval(resolved.value)
    expect(issued.ok).toBe(true)
    if (issued.ok) {
      expect(issued.value.stage).toBe("approval-issued")
      expect(issued.value.certificate?.councilId).toBe("phc")
      expect(issued.value.certificate?.id).toContain("HEALTH")
      expect(
        Date.parse(issued.value.certificate?.issuedAt ?? "")
      ).toBeGreaterThanOrEqual(
        Date.parse(issued.value.followUpNotice?.scheduledAt ?? "")
      )
    }
    expect(escalateInspection(resolved.value).ok).toBe(false)
  })

  it("records further action without an automatic sanction", () => {
    const followUp = scheduleFollowUpNotice(corrected())
    if (!followUp.ok) throw new Error(followUp.error)
    const acknowledged = acknowledgeFollowUpNotice(followUp.value)
    if (!acknowledged.ok) throw new Error(acknowledged.error)
    const outcome = escalateInspection(acknowledged.value)
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(outcome.value.stage).toBe("further-action")
      expect(outcome.value.certificate).toBeUndefined()
    }
  })
})
