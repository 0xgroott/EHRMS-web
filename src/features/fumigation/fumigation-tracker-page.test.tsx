import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FumigationProvider } from "./fumigation-context"
import { LICENSED_FUMIGATION_PROVIDERS } from "./fumigation-seeds"
import { createFumigationStore } from "./fumigation-store"
import { FumigationTrackerPage } from "./fumigation-tracker-page"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

Object.defineProperty(window, "PointerEvent", {
  configurable: true,
  value: MouseEvent,
})

beforeEach(() => {
  localStorage.clear()
  const provider = LICENSED_FUMIGATION_PROVIDERS[0]
  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-1",
      premisesName: "Riverside Kitchen",
      requestedPeriod: "2026-10",
      declaration: true,
      providerId: provider.id,
      totalNgn: provider.priceNgn,
      paymentReference: "FUM-PAY-FUMIGATION-APPLICATION-1",
      submittedAt: "2026-09-26T08:00:00.000Z",
      stage: "awaiting-provider",
    },
  })
})

function renderTracker() {
  return render(
    <FumigationProvider>
      <FumigationTrackerPage />
    </FumigationProvider>
  )
}

it("matches the Fitness tracker information hierarchy", async () => {
  renderTracker()

  expect(
    await screen.findByRole("heading", { name: "Application tracker" })
  ).toBeVisible()
  expect(
    screen.getByRole("status", { name: "Fumigation application status" })
  ).toHaveTextContent("Awaiting provider report")
  expect(screen.getByRole("region", { name: "The business" })).toBeVisible()
  expect(
    screen.getByRole("region", { name: "Application progress" })
  ).toBeVisible()
  expect(screen.getByRole("region", { name: "Service details" })).toBeVisible()
  expect(
    screen.getByRole("heading", { name: "Continue this flow" })
  ).toBeVisible()

  const receipt = screen.getByRole("link", { name: "View payment receipt" })
  expect(receipt).toHaveAttribute(
    "href",
    "/business/fumigation/payment-receipt"
  )
  expect(receipt).toHaveAttribute("target", "_blank")
})

it("shows provider contact details from the status banner", async () => {
  const provider = LICENSED_FUMIGATION_PROVIDERS[0]
  const user = userEvent.setup()
  renderTracker()

  await user.click(
    await screen.findByRole("button", { name: "Contact provider" })
  )
  const dialog = screen.getByRole("dialog", { name: "Contact provider" })
  expect(dialog).toHaveTextContent(provider.name)
  expect(dialog).toHaveTextContent(provider.location)
  expect(dialog).toHaveTextContent(provider.contact)
  expect(dialog).toHaveTextContent(provider.registrationNumber)
})

it("uses one contextual action and success dialog throughout the flow", async () => {
  const user = userEvent.setup()
  renderTracker()

  const progress = await screen.findByRole("region", {
    name: "Application progress",
  })
  expect(within(progress).getByText("Provider service report")).toBeVisible()
  expect(within(progress).getByText("EHO confirmation")).toBeVisible()

  await user.click(
    screen.getByRole("button", { name: "Confirm provider service" })
  )
  expect(
    screen.getByRole("dialog", { name: "Provider service confirmed" })
  ).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Continue" }))
  expect(
    screen.getByRole("button", { name: "Approve EHO confirmation" })
  ).toBeVisible()

  await user.click(
    screen.getByRole("button", { name: "Approve EHO confirmation" })
  )
  expect(
    screen.getByRole("dialog", { name: "EHO confirmation approved" })
  ).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Continue" }))
  expect(
    screen.getByRole("button", { name: "Approve council decision" })
  ).toBeVisible()
})
