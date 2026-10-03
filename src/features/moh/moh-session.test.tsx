import { render, screen, fireEvent } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { MohProvider, useMoh } from "./moh-session"

beforeEach(() => localStorage.clear())

function DecisionHarness() {
  const { decisions, approveHealthApproval, denyHealthApproval } = useMoh()
  const decision = decisions["HA-REV-001"]
  return (
    <div>
      <p>{decision?.outcome ?? "awaiting"}</p>
      {decision?.outcome === "denied" && <p>{decision.reason}</p>}
      <button onClick={() => approveHealthApproval("HA-REV-001")}>
        Approve
      </button>
      <button
        onClick={() => denyHealthApproval("HA-REV-001", "Kitchen not ready")}
      >
        Deny
      </button>
    </div>
  )
}

function InspectionHarness() {
  const { scheduledInspections, scheduleInspection } = useMoh()
  const inspection = scheduledInspections["HA-WORK-001"]
  return (
    <div>
      <p>{inspection?.stage ?? "unscheduled"}</p>
      <p>{inspection?.inspection?.officer}</p>
      <button
        onClick={() =>
          scheduleInspection("HA-WORK-001", {
            officer: "Ngozi Nwankwo",
            scheduledAt: "2026-10-06",
          })
        }
      >
        Schedule inspection
      </button>
    </div>
  )
}

describe("MOH decision state", () => {
  it("persists and restores approvals for the assigned MOH account", () => {
    const view = render(
      <MohProvider>
        <DecisionHarness />
      </MohProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Approve" }))
    expect(screen.getByText("approved")).toBeInTheDocument()
    expect(
      JSON.parse(
        localStorage.getItem("ehrcms:moh:MOH-001:decisions:v1") ?? "null"
      )
    ).toMatchObject({
      "HA-REV-001": {
        outcome: "approved",
        certificateNumber: "HAC-2026-001",
      },
    })

    view.unmount()
    render(
      <MohProvider>
        <DecisionHarness />
      </MohProvider>
    )

    expect(screen.getByText("approved")).toBeInTheDocument()
  })

  it("records the denial reason", () => {
    render(
      <MohProvider>
        <DecisionHarness />
      </MohProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Deny" }))
    expect(screen.getByText("denied")).toBeInTheDocument()
    expect(screen.getByText("Kitchen not ready")).toBeInTheDocument()
  })

  it("persists an inspection schedule for the assigned MOH account", () => {
    const view = render(
      <MohProvider>
        <InspectionHarness />
      </MohProvider>
    )

    fireEvent.click(screen.getByRole("button", { name: "Schedule inspection" }))
    expect(screen.getByText("inspection")).toBeInTheDocument()
    expect(screen.getByText("Ngozi Nwankwo")).toBeInTheDocument()
    expect(
      JSON.parse(
        localStorage.getItem(
          "ehrcms:moh:MOH-001:health-approval-inspections:v1"
        ) ?? "null"
      )
    ).toMatchObject({
      "HA-WORK-001": {
        stage: "inspection",
        inspection: {
          officer: "Ngozi Nwankwo",
          scheduledAt: "2026-10-06",
        },
      },
    })

    view.unmount()
    render(
      <MohProvider>
        <InspectionHarness />
      </MohProvider>
    )
    expect(screen.getByText("inspection")).toBeInTheDocument()
  })

  it("recovers from malformed saved inspection schedules", () => {
    localStorage.setItem(
      "ehrcms:moh:MOH-001:health-approval-inspections:v1",
      "{broken"
    )

    render(
      <MohProvider>
        <InspectionHarness />
      </MohProvider>
    )

    expect(screen.getByText("unscheduled")).toBeInTheDocument()
  })
})
