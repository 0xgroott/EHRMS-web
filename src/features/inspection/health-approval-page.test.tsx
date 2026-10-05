import { render } from "@/test/render-with-router"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { HealthApprovalPage } from "./health-approval-page"

type Fixture = {
  fitness: { application: null | { stage: string } }
  fumigation: { application: null | { stage: string } }
  inspection: null | {
    id: string
    councilId: string
    premisesName: string
    stage: string
    notice: { reference: string; scheduledAt: string }
    findings: Array<unknown>
    certificate?: {
      id: string
      councilId: string
      issuedAt: string
      expiresAt: string
    }
  }
  scheduleNotice: ReturnType<typeof vi.fn>
  issueApproval: ReturnType<typeof vi.fn>
}

const fixtures = vi.hoisted((): Fixture => ({
  fitness: { application: null },
  fumigation: { application: null },
  inspection: null,
  scheduleNotice: vi.fn(),
  issueApproval: vi.fn(),
}))

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: {
      profile: {
        premises: {
          premisesName: "Riverside Kitchen",
          address: "12 Abonnema Wharf Road",
          councilId: "phc",
        },
      },
    },
  }),
}))
vi.mock("@/features/fitness/fitness-context", () => ({
  useFitness: () => ({ state: fixtures.fitness, isHydrated: true }),
}))
vi.mock("@/features/fumigation/fumigation-context", () => ({
  useFumigation: () => ({ state: fixtures.fumigation, isHydrated: true }),
}))
vi.mock("./inspection-context", () => ({
  useInspection: () => ({
    state: { inspection: fixtures.inspection },
    isHydrated: true,
    scheduleNotice: fixtures.scheduleNotice,
    issueApproval: fixtures.issueApproval,
  }),
}))

beforeEach(() => {
  fixtures.fitness.application = null
  fixtures.fumigation.application = null
  fixtures.inspection = null
  fixtures.scheduleNotice.mockReset()
  fixtures.scheduleNotice.mockReturnValue({ ok: true, value: {} })
  fixtures.issueApproval.mockReset()
})

it("shows each missing certificate and its relevant path without an application action", () => {
  render(<HealthApprovalPage />)
  expect(
    screen.getByRole("link", { name: /complete fitness/i })
  ).toHaveAttribute("href", "/business/fitness/apply")
  expect(
    screen.getByRole("link", { name: /complete fumigation/i })
  ).toHaveAttribute("href", "/business/fumigation/apply")
  expect(
    screen.queryByRole("link", { name: /apply for health approval/i })
  ).not.toBeInTheDocument()
})

it("separates council scheduling from the business inspection action", async () => {
  fixtures.fitness.application = { stage: "issued" }
  fixtures.fumigation.application = { stage: "issued" }
  render(<HealthApprovalPage />)
  const controls = screen.getByRole("region", {
    name: /council updates/i,
  })
  await userEvent.setup().click(
    within(controls).getByRole("button", {
      name: /show inspection notice/i,
    })
  )
  expect(fixtures.scheduleNotice).toHaveBeenCalledWith(true)
  expect(
    screen.queryByRole("link", { name: /view inspection/i })
  ).not.toBeInTheDocument()
})

it("shows the issued outcome with a non-official disclosure", () => {
  fixtures.fitness.application = { stage: "issued" }
  fixtures.fumigation.application = { stage: "issued" }
  fixtures.inspection = {
    id: "INSP-001",
    councilId: "phc",
    premisesName: "Riverside Kitchen",
    stage: "approval-issued",
    notice: {
      reference: "NOTICE-001",
      scheduledAt: "2026-09-20T09:00:00.000Z",
    },
    findings: [],
    certificate: {
      id: "HA-001",
      councilId: "phc",
      issuedAt: "2026-09-22T09:00:00.000Z",
      expiresAt: "2027-09-22T09:00:00.000Z",
    },
  }
  render(<HealthApprovalPage />)
  expect(screen.getByRole("heading", { name: "Health Approval" })).toBeVisible()
  expect(screen.getByText("HA-001")).toBeVisible()
  expect(
    screen.getByRole("heading", { name: "Health Approval issued" })
  ).toBeVisible()
  expect(
    screen.getByRole("button", { name: "Download Health Approval" })
  ).toBeVisible()
  expect(
    screen.getByRole("link", { name: /view inspection record/i })
  ).toHaveAttribute("href", "/business/inspections")
})

it("surfaces unresolved findings from the inspection record", () => {
  fixtures.fitness.application = { stage: "issued" }
  fixtures.fumigation.application = { stage: "issued" }
  fixtures.inspection = {
    id: "INSP-001",
    councilId: "phc",
    premisesName: "Riverside Kitchen",
    stage: "findings-issued",
    notice: {
      reference: "NOTICE-001",
      scheduledAt: "2026-09-20T09:00:00.000Z",
    },
    findings: [{ id: "F-1" }, { id: "F-2" }],
  }
  render(<HealthApprovalPage />)
  expect(screen.getByText("2 findings require correction")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "View required actions" })
  ).toHaveAttribute("href", "/business/inspections")
})
