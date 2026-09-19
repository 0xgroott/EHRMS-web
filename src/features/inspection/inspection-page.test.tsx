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

  const saveButtons = screen.getAllByRole("button", { name: "Save correction" })
  await user.click(saveButtons[0])
  expect(
    screen.getByText("Enter a correction note before saving.")
  ).toBeInTheDocument()
  expect(fixtures.recordCorrection).not.toHaveBeenCalled()

  await user.type(
    screen.getAllByRole("textbox", { name: "How was this corrected?" })[0],
    "Updated and signed the cleaning register."
  )
  await user.click(saveButtons[0])
  expect(fixtures.recordCorrection).toHaveBeenCalledWith(
    "finding-1",
    "Updated and signed the cleaning register."
  )
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
