import { render } from "@/test/render-with-router"
import { fireEvent, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FumigationApplicationPage } from "./fumigation-application-page"
import { FumigationProvider } from "./fumigation-context"
import { LICENSED_FUMIGATION_PROVIDERS } from "./fumigation-seeds"
import { createFumigationStore } from "./fumigation-store"

vi.mock(
  "@/components/ui/select",
  async () => import("@/features/fitness/select-test-double")
)

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
  if (returningBusinessState.profile) {
    returningBusinessState.profile.branches = undefined
  }
})

function renderPage(
  props: React.ComponentProps<typeof FumigationApplicationPage> = {}
) {
  return render(
    <FumigationProvider>
      <FumigationApplicationPage {...props} />
    </FumigationProvider>
  )
}

it("uses the Fitness application layout with a right-hand progress guide", async () => {
  renderPage()

  expect(
    await screen.findByRole("link", { name: "Back to applications" })
  ).toHaveAttribute("href", "/business/applications")
  expect(
    screen.getByRole("heading", { name: "Application details", level: 1 })
  ).toBeVisible()
  const guide = screen.getByRole("complementary", {
    name: "Application progress",
  })
  expect(within(guide).getByText("0 of 4 completed")).toBeVisible()
  expect(
    within(guide).getByText("Application details").closest("li")
  ).toHaveAttribute("aria-current", "step")
  expect(within(guide).getByText("Payment & submission")).toBeVisible()
})

it("allows a business with multiple branches to choose the application location", async () => {
  const primary = returningBusinessState.profile?.premises
  if (!returningBusinessState.profile || !primary) throw new Error("No profile")
  returningBusinessState.profile.branches = [
    primary,
    {
      ...primary,
      premisesName: "Riverside Kitchen, Rumuodara",
      address: "8 Rumuodara Road",
      ward: "Rumuodara",
    },
  ]
  const user = userEvent.setup()
  renderPage()

  const branch = await screen.findByRole("combobox", {
    name: "Business branch/location",
  })
  expect(branch).toBeEnabled()
  await user.selectOptions(branch, "Riverside Kitchen, Rumuodara")
  fireEvent.change(screen.getByLabelText("Requested service month"), {
    target: { value: "2026-10" },
  })
  await user.click(screen.getByRole("checkbox"))
  await user.click(screen.getByRole("button", { name: "Next" }))

  expect(createFumigationStore().read("BUS-001").application).toMatchObject({
    premisesName: "Riverside Kitchen, Rumuodara",
    requestedPeriod: "2026-10",
  })
})

it("advances all four steps within the same full-page application", async () => {
  const onPaid = vi.fn()
  const user = userEvent.setup()
  renderPage({ onPaid })

  fireEvent.change(await screen.findByLabelText("Requested service month"), {
    target: { value: "2026-10" },
  })
  await user.click(screen.getByRole("checkbox"))
  await user.click(screen.getByRole("button", { name: "Next" }))
  await user.click(
    screen.getByRole("radio", {
      name: new RegExp(LICENSED_FUMIGATION_PROVIDERS[0].name),
    })
  )
  await user.click(screen.getByRole("button", { name: "Next" }))

  expect(
    screen.getByRole("heading", { name: "Review application", level: 1 })
  ).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Continue to payment" }))
  expect(
    screen.getByRole("heading", { name: "Payment & submission", level: 1 })
  ).toBeVisible()
  const guide = screen.getByRole("complementary", {
    name: "Application progress",
  })
  expect(within(guide).getByText("3 of 4 completed")).toBeVisible()

  await user.click(
    screen.getByRole("button", { name: "Confirm payment and submit" })
  )
  expect(onPaid).toHaveBeenCalledOnce()
  expect(createFumigationStore().read("BUS-001").application?.stage).toBe(
    "awaiting-provider"
  )
})
