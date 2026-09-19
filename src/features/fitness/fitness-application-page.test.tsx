import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterAll, beforeAll, beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FitnessProvider } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"
import type { FitnessState, FoodHandler } from "./fitness-types"
import { FitnessApplicationPage } from "./fitness-application-page"
import { FitnessTrackerPage } from "./fitness-tracker-page"
import { FitnessCertificatePage } from "./fitness-certificate-page"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

const handler: FoodHandler = {
  id: "ada",
  fullName: "Ada Okafor",
  role: "Cook",
  sex: "Female",
  dateOfBirth: "1990-01-01",
  identityNumber: "DEMO-123",
  phone: "08030000000",
  premisesName: "Riverside Kitchen",
  consent: true,
}

beforeEach(() => localStorage.clear())
beforeAll(() => vi.stubGlobal("PointerEvent", MouseEvent))
afterAll(() => vi.unstubAllGlobals())

function mount(page: React.ReactNode, state?: FitnessState) {
  if (state) createFitnessStore().write("BUS-001", state)
  return render(<FitnessProvider>{page}</FitnessProvider>)
}

it("blocks an empty selection and explains an incomplete handler", async () => {
  mount(<FitnessApplicationPage />, {
    handlers: [
      handler,
      { ...handler, id: "b", fullName: "Bola James", consent: false },
    ],
    application: null,
  })
  const user = userEvent.setup()
  expect(screen.getByRole("checkbox", { name: /Bola James/ })).toHaveAttribute(
    "aria-disabled",
    "true"
  )
  expect(screen.getByText("Record the handler's consent")).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Continue to facility" }))
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Select at least one eligible food handler"
  )
  expect(
    screen.queryByRole("button", { name: "Confirm payment" })
  ).not.toBeInTheDocument()
})

it("takes eligible people through review and simulated payment, then separate external decisions", async () => {
  const user = userEvent.setup()
  const onPaid = vi.fn()
  let view = mount(<FitnessApplicationPage onPaid={onPaid} />, {
    handlers: [handler],
    application: null,
  })
  await user.click(screen.getByRole("checkbox", { name: /Ada Okafor/ }))
  await user.click(screen.getByRole("button", { name: "Continue to facility" }))
  await user.click(
    screen.getByRole("radio", { name: /Port Harcourt City Health Centre/ })
  )
  await user.click(screen.getByRole("button", { name: "Review application" }))
  expect(
    screen.getByRole("heading", { name: "Review your application" })
  ).toBeVisible()
  expect(screen.getByText("Riverside Kitchen")).toBeVisible()
  expect(screen.getByText("Ada Okafor")).toBeVisible()
  expect(screen.getByText("₦12,500")).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Proceed to payment" }))
  expect(screen.getByText(/No money will move/)).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Confirm payment" }))
  expect(onPaid).toHaveBeenCalledOnce()
  expect(
    createFitnessStore().read("BUS-001").application?.certificate
  ).toBeUndefined()
  view.unmount()
  view = mount(<FitnessTrackerPage />)
  expect(
    screen.getByRole("heading", { name: "Awaiting facility result" })
  ).toBeVisible()
  const controls = screen.getByRole("region", {
    name: "Facility and council actions",
  })
  expect(
    within(controls).getByRole("button", { name: "Simulate council issuance" })
  ).toBeDisabled()
  await user.click(
    within(controls).getByRole("button", {
      name: "Simulate facility Fit result",
    })
  )
  expect(
    screen.getByRole("heading", { name: "Facility result received: Fit" })
  ).toBeVisible()
  await user.click(
    within(controls).getByRole("button", { name: "Simulate council issuance" })
  )
  expect(
    screen.getByRole("link", { name: "View Fitness Certificate" })
  ).toHaveAttribute("href", "/business/fitness/certificate")
  view.unmount()
  mount(<FitnessCertificatePage />)
  expect(
    screen.getByRole("heading", { name: "Fitness Certificate" })
  ).toBeVisible()
  expect(screen.getByText("Ada Okafor")).toBeVisible()
  expect(screen.getByText("Port Harcourt City")).toBeVisible()
  expect(screen.getByText("Issue date")).toBeVisible()
  expect(screen.getByText("Expiry date")).toBeVisible()
  expect(screen.getByText(/Not valid for regulatory use/)).toBeVisible()
  expect(
    screen.queryByRole("link", { name: /download/i })
  ).not.toBeInTheDocument()
})

it("restores saved review selection after reload and allows changes before payment", async () => {
  const user = userEvent.setup()
  mount(<FitnessApplicationPage />, {
    handlers: [handler],
    application: {
      id: "demo",
      stage: "review",
      handlerIds: ["ada"],
      facilityId: "phc-health-centre",
      totalNgn: 12500,
    },
  })
  expect(
    screen.getByRole("heading", { name: "Review your application" })
  ).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Change food handlers" }))
  expect(screen.getByRole("checkbox", { name: /Ada Okafor/ })).toBeChecked()
})

it("directs a premature certificate visit to the application", () => {
  mount(<FitnessCertificatePage />)
  expect(screen.getByText("No Fitness certificate yet")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "Start Fitness application" })
  ).toHaveAttribute("href", "/business/fitness/apply")
})
