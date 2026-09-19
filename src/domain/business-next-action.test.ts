import { describe, expect, it } from "vitest"
import type { BusinessAlert } from "./business-types"
import { getBusinessNextAction } from "./business-next-action"

const alert = (id: string, dueAt = "2026-09-20"): BusinessAlert => ({
  id,
  dueAt,
  kind: "inspection",
  urgent: true,
  title: `Inspection ${id}`,
  href: "/business/inspections",
})
const ready = {
  profileComplete: true,
  alerts: [],
  foodHandlerCount: 1,
  fitness: "active",
  fumigation: "active",
  missingHealthApprovalRequirement: false,
} as const

describe("business next action", () => {
  it("prioritizes an incomplete profile over urgent alerts", () => {
    expect(
      getBusinessNextAction({
        ...ready,
        profileComplete: false,
        alerts: [alert("a")],
      })
    ).toMatchObject({ id: "complete-profile", href: "/business/setup" })
  })
  it("chooses urgent alerts before food handlers, earliest deadline then id, without mutating input", () => {
    const alerts = [
      alert("z"),
      alert("b", "2026-09-19"),
      alert("a", "2026-09-19"),
    ]
    expect(
      getBusinessNextAction({ ...ready, alerts, foodHandlerCount: 0 })
    ).toMatchObject({
      id: "urgent-alert",
      title: "Inspection a",
      href: "/business/inspections",
    })
    expect(alerts.map((item) => item.id)).toEqual(["z", "b", "a"])
  })
  it("ignores non-urgent alerts and starts with food handlers", () => {
    expect(
      getBusinessNextAction({
        ...ready,
        alerts: [{ ...alert("a"), urgent: false }],
        foodHandlerCount: 0,
      })
    ).toMatchObject({
      id: "add-food-handlers",
      href: "/business/food-handlers",
    })
  })
  it.each(["not-started", "expired"] as const)(
    "prioritizes Fitness when %s",
    (fitness) => {
      expect(
        getBusinessNextAction({ ...ready, fitness, fumigation: "not-started" })
      ).toMatchObject({ id: "start-fitness", href: "/business/fitness/apply" })
    }
  )
  it("tracks an in-progress Fitness application before starting Fumigation", () => {
    expect(
      getBusinessNextAction({
        ...ready,
        fitness: "in-progress",
        fumigation: "not-started",
        fitnessActionHref: "/business/fitness/tracker",
      })
    ).toMatchObject({
      id: "track-fitness",
      href: "/business/fitness/tracker",
    })
  })
  it("renews expired Fumigation before missing Health Approval conditions", () => {
    expect(
      getBusinessNextAction({
        ...ready,
        fumigation: "expired",
        missingHealthApprovalRequirement: true,
      })
    ).toMatchObject({ id: "start-fumigation" })
  })
  it("points to missing requirements without offering Health Approval application", () => {
    expect(
      getBusinessNextAction({
        ...ready,
        missingHealthApprovalRequirement: true,
      })
    ).toMatchObject({
      id: "complete-health-requirement",
      href: "/business/certificates",
      label: "Review missing requirements",
    })
  })
  it("routes eligible premises through the inspection and corrective action steps", () => {
    expect(
      getBusinessNextAction({ ...ready, healthApprovalStage: "eligible" })
    ).toMatchObject({
      id: "health-eligible",
      href: "/business/health-approval",
    })
    expect(
      getBusinessNextAction({ ...ready, healthApprovalStage: "notice-served" })
    ).toMatchObject({
      id: "acknowledge-inspection",
      href: "/business/inspections",
    })
    expect(
      getBusinessNextAction({
        ...ready,
        healthApprovalStage: "findings-issued",
      })
    ).toMatchObject({
      id: "correct-findings",
      href: "/business/inspections",
    })
    expect(
      getBusinessNextAction({ ...ready, healthApprovalStage: "resolved" })
    ).toMatchObject({
      id: "review-health-decision",
      href: "/business/health-approval",
    })
  })
  it("monitors compliance when no prerequisite requires action", () => {
    expect(getBusinessNextAction(ready)).toMatchObject({
      id: "monitor-compliance",
      href: "/business/certificates",
    })
  })
  it("uses a safe existing inspection route regardless of persisted alert href", () => {
    expect(
      getBusinessNextAction({
        ...ready,
        alerts: [{ ...alert("a"), href: "javascript:alert(1)" }],
      }).href
    ).toBe("/business/inspections")
  })
})
