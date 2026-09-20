import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
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

beforeEach(() => {
  localStorage.clear()
  vi.useRealTimers()
})
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
  expect(screen.getByRole("checkbox", { name: /Bola James/ })).toHaveAttribute(
    "aria-disabled",
    "true"
  )
  expect(screen.getByText("Record the handler's consent")).toBeVisible()
  expect(screen.getByRole("table")).toBeVisible()
  expect(screen.getByRole("row", { name: /Bola James/ })).toBeVisible()
  expect(screen.getByRole("status")).toHaveTextContent("0 of 2 selected")
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()
  expect(
    screen.queryByRole("button", { name: "Confirm payment" })
  ).not.toBeInTheDocument()
})

it("shows the dedicated application layout and progress guide", () => {
  mount(<FitnessApplicationPage />, {
    handlers: [handler],
    application: null,
  })
  expect(
    screen.getByRole("heading", { name: "Select food handlers", level: 1 })
  ).toBeVisible()
  expect(
    screen.getByRole("complementary", { name: "Application progress" })
  ).toBeVisible()
  expect(
    screen.getByRole("link", { name: "Back to applications" })
  ).toBeVisible()
  expect(screen.queryByText("Step 1 of 4")).not.toBeInTheDocument()
  expect(
    screen.queryByText("Your progress is saved as you complete each stage.")
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
  expect(screen.getByRole("status")).toHaveTextContent("1 of 1 selected")
  await user.click(screen.getByRole("button", { name: "Next" }))
  await user.click(
    screen.getByRole("radio", { name: /Port Harcourt City Health Centre/ })
  )
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(
    screen.getByRole("heading", { name: "Review your application" })
  ).toBeVisible()
  expect(screen.getByText("Riverside Kitchen")).toBeVisible()
  expect(screen.getByText("Ada Okafor")).toBeVisible()
  expect(screen.getByText("₦12,500")).toBeVisible()
  expect(
    within(screen.getByRole("region", { name: "Application summary" }))
      .getAllByRole("term")
      .map((term) => term.textContent)
  ).toEqual(["Premises", "Facility", "Service", "Food handlers · 1"])
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(screen.getByRole("heading", { name: "Payment options" })).toBeVisible()
  expect(screen.getByText("Civic Health Bank")).toBeVisible()
  await user.click(screen.getByRole("radio", { name: /Paystack/ }))
  expect(screen.queryByText("Civic Health Bank")).not.toBeInTheDocument()
  expect(
    screen.getByText("Paystack supports card and bank payments.")
  ).toBeVisible()
  await user.click(screen.getByRole("radio", { name: /Card payment/ }))
  expect(screen.getByText("Pay with a debit or credit card.")).toBeVisible()
  vi.useFakeTimers()
  fireEvent.click(screen.getByRole("button", { name: "I have made payment" }))
  expect(
    screen.getByRole("button", { name: "Checking payment…" })
  ).toBeDisabled()
  expect(onPaid).not.toHaveBeenCalled()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5999)
  })
  expect(onPaid).not.toHaveBeenCalled()
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1)
  })
  vi.useRealTimers()
  expect(onPaid).toHaveBeenCalledOnce()
  const success = screen.getByRole("dialog", {
    name: "Application submitted",
  })
  expect(success).toBeVisible()
  expect(
    within(success).getByText(
      "Payment confirmed. Application submitted. Track it on the Applications page."
    )
  ).toBeVisible()
  expect(
    within(success).queryByText(/contact your selected facility/i)
  ).not.toBeInTheDocument()
  expect(
    createFitnessStore().read("BUS-001").application?.certificate
  ).toBeUndefined()
  view.unmount()
  view = mount(<FitnessTrackerPage />)
  expect(
    screen.getByRole("heading", { name: "Awaiting facility result" })
  ).toBeVisible()
  const controls = screen.getByRole("region", {
    name: "Facility and council updates",
  })
  expect(
    within(controls).getByRole("button", { name: "Show council decision" })
  ).toBeDisabled()
  await user.click(
    within(controls).getByRole("button", {
      name: "Show facility Fit result",
    })
  )
  expect(
    screen.getByRole("heading", { name: "Facility result received: Fit" })
  ).toBeVisible()
  await user.click(
    within(controls).getByRole("button", { name: "Show council decision" })
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
  expect(
    screen.getByRole("button", { name: "Download certificate" })
  ).toBeVisible()
  expect(
    screen.queryByRole("link", { name: /download/i })
  ).not.toBeInTheDocument()
})

it("restores the saved review summary after reload", () => {
  mount(<FitnessApplicationPage />, {
    handlers: [
      handler,
      { ...handler, id: "bola", fullName: "Bola James", role: "Server" },
    ],
    application: {
      id: "demo",
      stage: "review",
      handlerIds: ["ada", "bola"],
      facilityId: "phc-health-centre",
      totalNgn: 25000,
    },
  })
  expect(
    screen.getByRole("heading", { name: "Review your application" })
  ).toBeVisible()
  const summary = screen.getByRole("region", { name: "Application summary" })
  const people = within(summary).getAllByRole("listitem")
  expect(people).toHaveLength(2)
  expect(people[0]).toHaveTextContent("Ada Okafor")
  expect(people[0]).toHaveTextContent("Cook")
  expect(people[1]).toHaveTextContent("Bola James")
  expect(people[1]).toHaveTextContent("Server")
  expect(within(summary).getByText("Total", { exact: true })).toBeVisible()
  expect(
    within(summary).queryByText("Total for this application")
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole("button", { name: "Change food handlers" })
  ).not.toBeInTheDocument()
})

it("offers only staff without an issued certificate in a new-staff draft", () => {
  mount(<FitnessApplicationPage />, {
    handlers: [handler, { ...handler, id: "bola", fullName: "Bola James" }],
    application: {
      id: "fitness-application-2",
      handlerIds: [],
      purpose: "new-staff",
      stage: "draft",
    },
    history: [
      {
        id: "fitness-application-1",
        handlerIds: ["ada"],
        stage: "issued",
        certificate: {
          id: "FIT-CERT-1",
          handlerIds: ["ada"],
          councilId: "phc",
          issuedAt: "2026-01-01",
          expiresAt: "2027-01-01",
        },
      },
    ],
  })

  expect(
    screen.getByRole("heading", { name: "Select new food handlers" })
  ).toBeVisible()
  expect(screen.getByRole("row", { name: /Bola James/ })).toBeVisible()
  expect(
    screen.queryByRole("row", { name: /Ada Okafor/ })
  ).not.toBeInTheDocument()
  expect(screen.getByRole("status")).toHaveTextContent("0 of 1 selected")
})

it("calculates the group total and resets the copied phone icon after three seconds", async () => {
  const copy = vi.fn().mockResolvedValue(undefined)
  const user = userEvent.setup()
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: copy },
  })
  mount(<FitnessApplicationPage />, {
    handlers: [handler, { ...handler, id: "bola", fullName: "Bola James" }],
    application: null,
  })
  await user.click(screen.getByRole("checkbox", { name: /Ada Okafor/ }))
  await user.click(screen.getByRole("checkbox", { name: /Bola James/ }))
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(screen.getByText("₦12,500 × 2 food handlers")).toBeVisible()
  expect(screen.getByText("₦25,000")).toBeVisible()
  expect(screen.queryByText("Total for 2 people")).not.toBeInTheDocument()
  const facility = screen.getByRole("radio", {
    name: /Port Harcourt City Health Centre/,
  })
  await user.click(
    screen.getByRole("button", {
      name: "Copy Port Harcourt City Health Centre phone number",
    })
  )
  expect(copy).toHaveBeenCalledWith("0803 555 0140")
  expect(facility).not.toBeChecked()
  expect(
    screen.getByRole("button", {
      name: "Copied Port Harcourt City Health Centre phone number",
    })
  ).toBeVisible()
  await waitFor(
    () =>
      expect(
        screen.getByRole("button", {
          name: "Copy Port Harcourt City Health Centre phone number",
        })
      ).toBeVisible(),
    { timeout: 4000 }
  )
  await user.click(screen.getByText("₦12,500 × 2 food handlers"))
  expect(facility).toBeChecked()
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(createFitnessStore().read("BUS-001").application?.totalNgn).toBe(25000)
  expect(screen.getByText("₦25,000")).toBeVisible()
})

it("directs a premature certificate visit to the application", () => {
  mount(<FitnessCertificatePage />)
  expect(screen.getByText("No Fitness certificate yet")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "Start Fitness application" })
  ).toHaveAttribute("href", "/business/fitness/apply")
})
