import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { InspectionPage } from "./inspection-page"
import type { InspectionCase } from "./inspection-types"

const fixtures = vi.hoisted(() => ({
  inspection: null as InspectionCase | null,
  acknowledgeNotice: vi.fn(),
  issueFindings: vi.fn(),
  recordCorrection: vi.fn(),
  scheduleFollowUp: vi.fn(),
  acknowledgeFollowUp: vi.fn(),
  resolveFollowUp: vi.fn(),
  escalateFollowUp: vi.fn(),
}))

vi.mock("./inspection-context", () => ({
  useInspection: () => ({
    state: { inspection: fixtures.inspection },
    isHydrated: true,
    acknowledgeNotice: fixtures.acknowledgeNotice,
    issueFindings: fixtures.issueFindings,
    recordCorrection: fixtures.recordCorrection,
    scheduleFollowUp: fixtures.scheduleFollowUp,
    acknowledgeFollowUp: fixtures.acknowledgeFollowUp,
    resolveFollowUp: fixtures.resolveFollowUp,
    escalateFollowUp: fixtures.escalateFollowUp,
  }),
}))

beforeEach(() => {
  fixtures.inspection = null
  for (const action of [
    fixtures.acknowledgeNotice,
    fixtures.issueFindings,
    fixtures.recordCorrection,
    fixtures.scheduleFollowUp,
    fixtures.acknowledgeFollowUp,
    fixtures.resolveFollowUp,
    fixtures.escalateFollowUp,
  ]) {
    action.mockReset().mockReturnValue({ ok: true, value: {} })
  }
})

function caseAt(stage: InspectionCase["stage"]): InspectionCase {
  return {
    id: "inspection-1",
    councilId: "phc",
    premisesName: "Riverside Kitchen",
    stage,
    notice: {
      reference: "INS-NOTICE-1",
      scheduledAt: "2026-09-28T10:00:00.000Z",
      acknowledgedAt: "2026-09-20T10:00:00.000Z",
    },
    findings: [
      {
        id: "finding-1",
        title: "Cleaning records",
        action: "Update the cleaning register.",
        deadline: "2026-10-05T10:00:00.000Z",
      },
      {
        id: "finding-2",
        title: "Waste storage",
        action: "Secure the waste bins.",
        deadline: "2026-10-05T10:00:00.000Z",
      },
    ],
  }
}

it("requires a correction note for each finding and keeps council actions separate", async () => {
  fixtures.inspection = caseAt("findings-issued")
  const user = userEvent.setup()
  render(<InspectionPage />)

  expect(
    screen.getByRole("heading", { name: "Inspections" })
  ).toBeInTheDocument()
  const councilControls = screen.getByRole("region", {
    name: /council actions/i,
  })
  expect(
    within(councilControls).getByRole("button", {
      name: /simulate follow-up notice/i,
    })
  ).toBeDisabled()

  const correctionActions = screen.getAllByRole("button", {
    name: "Record correction",
  })
  expect(
    screen.queryByRole("textbox", { name: "How was this corrected?" })
  ).not.toBeInTheDocument()
  await user.click(correctionActions[0])
  const drawer = screen.getByRole("dialog", { name: "Record correction" })
  expect(within(drawer).getByText("Cleaning records")).toBeInTheDocument()
  await user.click(
    within(drawer).getByRole("button", { name: "Save correction" })
  )
  expect(
    within(drawer).getByText("Enter a correction note before saving.")
  ).toBeInTheDocument()
  expect(fixtures.recordCorrection).not.toHaveBeenCalled()

  await user.type(
    within(drawer).getByRole("textbox", { name: "How was this corrected?" }),
    "Updated and signed the cleaning register."
  )
  await user.click(
    within(drawer).getByRole("button", { name: "Save correction" })
  )
  expect(fixtures.recordCorrection).toHaveBeenCalledWith(
    "finding-1",
    "Updated and signed the cleaning register."
  )
  expect(screen.getByRole("status")).toHaveTextContent(
    "Correction recorded for Cleaning records."
  )

  await user.click(
    screen.getAllByRole("button", { name: "Record correction" })[1]
  )
  const secondDrawer = screen.getByRole("dialog", { name: "Record correction" })
  expect(within(secondDrawer).getByText("Waste storage")).toBeInTheDocument()
  await user.type(
    within(secondDrawer).getByRole("textbox", {
      name: "How was this corrected?",
    }),
    "Secured the waste bins."
  )
  await user.click(
    within(secondDrawer).getByRole("button", { name: "Save correction" })
  )
  expect(fixtures.recordCorrection).toHaveBeenCalledWith(
    "finding-2",
    "Secured the waste bins."
  )
})

it("dismisses an unfinished correction and clears its validation", async () => {
  fixtures.inspection = caseAt("findings-issued")
  const user = userEvent.setup()
  render(<InspectionPage />)

  await user.click(
    screen.getAllByRole("button", { name: "Record correction" })[0]
  )
  await user.click(screen.getByRole("button", { name: "Save correction" }))
  expect(
    screen.getByText("Enter a correction note before saving.")
  ).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Cancel" }))
  expect(
    screen.queryByRole("dialog", { name: "Record correction" })
  ).not.toBeInTheDocument()
  expect(fixtures.recordCorrection).not.toHaveBeenCalled()

  await user.click(
    screen.getAllByRole("button", { name: "Record correction" })[0]
  )
  expect(
    screen.queryByText("Enter a correction note before saving.")
  ).not.toBeInTheDocument()
})

it("requires a separate acknowledgement for the follow-up notice", async () => {
  fixtures.inspection = {
    ...caseAt("follow-up-served"),
    followUpNotice: {
      reference: "INS-FOLLOW-UP-1",
      scheduledAt: "2026-10-09T10:00:00.000Z",
    },
  }
  const user = userEvent.setup()
  render(<InspectionPage />)
  await user.click(
    screen.getByRole("button", { name: "Acknowledge follow-up notice" })
  )
  expect(fixtures.acknowledgeFollowUp).toHaveBeenCalledOnce()
  expect(fixtures.acknowledgeNotice).not.toHaveBeenCalled()
})
