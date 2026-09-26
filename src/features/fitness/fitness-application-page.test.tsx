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
  const copy = vi.fn().mockResolvedValue(undefined)
  const user = userEvent.setup()
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: copy },
  })
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
    screen.getByRole("heading", { name: "Application tracker" })
  ).toBeVisible()
  expect(document.querySelector('[data-slot="page-header"]')).not.toHaveClass(
    "border-b"
  )
  const status = screen.getByRole("status", {
    name: "Fitness application status",
  })
  expect(status).toHaveTextContent("Awaiting facility result")
  expect(status).toHaveTextContent(/approved facility/i)
  expect(
    within(status).getByRole("button", { name: "Contact facility" })
  ).toBeVisible()
  expect(screen.queryByText("Application submitted")).not.toBeInTheDocument()

  const business = screen.getByRole("region", { name: "The business" })
  expect(
    within(business)
      .getAllByRole("term")
      .map((term) => term.textContent)
  ).toEqual([
    "Business",
    "Approved facility",
    "Payment total",
    "Payment reference",
  ])
  expect(within(business).getByText("Riverside Kitchen")).toBeVisible()
  expect(
    within(business).getByText("Port Harcourt City Health Centre")
  ).toBeVisible()
  expect(
    screen.queryByText("16 Aggrey Road, Old GRA, Port Harcourt")
  ).not.toBeInTheDocument()
  expect(screen.queryByText("0803 555 0140")).not.toBeInTheDocument()

  const receipt = within(business).getByRole("link", {
    name: "View payment receipt",
  })
  expect(receipt).toHaveAttribute("href", "/business/fitness/payment-receipt")
  expect(receipt).toHaveAttribute("target", "_blank")
  expect(receipt).toHaveAttribute("rel", expect.stringContaining("noopener"))
  expect(receipt).toHaveClass("mt-3")
  expect(receipt.querySelector(".lucide-external-link")).toBeInTheDocument()
  expect(
    within(business).queryByRole("table", {
      name: "Staff included in this application",
    })
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole("button", { name: "Download payment record" })
  ).not.toBeInTheDocument()

  await user.click(
    within(status).getByRole("button", { name: "Contact facility" })
  )
  const facilityDialog = screen.getByRole("dialog", {
    name: "Contact facility",
  })
  expect(
    within(facilityDialog).getByText("Port Harcourt City Health Centre")
  ).toBeVisible()
  expect(
    within(facilityDialog).getByText("16 Aggrey Road, Old GRA, Port Harcourt")
  ).toBeVisible()
  expect(
    within(facilityDialog).getByRole("link", { name: "0803 555 0140" })
  ).toHaveAttribute("href", "tel:08035550140")
  expect(
    within(facilityDialog).getByRole("link", {
      name: "appointments@phchealthcentre.example",
    })
  ).toHaveAttribute("href", "mailto:appointments@phchealthcentre.example")
  const phoneCopy = within(
    within(facilityDialog).getByRole("link", { name: "0803 555 0140" })
      .parentElement!
  ).getByRole("button", { name: "Copy phone number" })
  const emailCopy = within(
    within(facilityDialog).getByRole("link", {
      name: "appointments@phchealthcentre.example",
    }).parentElement!
  ).getByRole("button", { name: "Copy email address" })
  await user.click(phoneCopy)
  expect(copy).toHaveBeenCalledWith("0803 555 0140")
  expect(
    within(facilityDialog).getByRole("button", {
      name: "Copied phone number",
    })
  ).toBeVisible()
  await user.click(emailCopy)
  expect(copy).toHaveBeenCalledWith("appointments@phchealthcentre.example")
  expect(
    within(facilityDialog).getByRole("button", {
      name: "Copied email address",
    })
  ).toBeVisible()
  await user.click(
    within(facilityDialog).getByRole("button", { name: "Close" })
  )

  const staffSection = screen.getByRole("region", {
    name: "Staff in this application",
  })
  const staff = within(staffSection).getByRole("table", {
    name: "Staff included in this application",
  })
  expect(
    within(staff).getByRole("columnheader", { name: "Name" })
  ).toBeVisible()
  expect(
    within(staff).getByRole("columnheader", { name: "Role" })
  ).toBeVisible()
  expect(within(staff).getByText("Ada Okafor")).toBeVisible()
  expect(within(staff).getByText("Cook")).toBeVisible()

  const progress = screen.getByRole("region", {
    name: "Application progress",
  })
  const steps = within(progress).getAllByRole("listitem")
  expect(steps).toHaveLength(4)
  expect(steps[0]).toHaveTextContent("Submit application")
  expect(steps[0]).toHaveTextContent("Complete")
  expect(steps[1]).toHaveTextContent("Confirm payment")
  expect(steps[1]).toHaveTextContent("Complete")
  expect(steps[2]).toHaveTextContent("Facility test results")
  expect(steps[2]).toHaveTextContent("Pending")
  expect(steps[2]).toHaveAttribute("aria-current", "step")
  expect(steps[3]).toHaveTextContent("Council decision")
  expect(steps[3]).toHaveTextContent("Pending")
  const controls = screen.getByRole("region", {
    name: "Continue this flow",
  })
  expect(within(controls).getAllByRole("button")).toHaveLength(1)
  await user.click(
    within(controls).getByRole("button", {
      name: "Approve Fitness Test",
    })
  )
  const testApproval = screen.getByRole("dialog", {
    name: "Fitness tests approved",
  })
  expect(testApproval.querySelectorAll(".fitness-confetti-piece")).toHaveLength(
    12
  )
  await user.click(
    within(testApproval).getByRole("button", { name: "Continue" })
  )
  expect(status).toHaveTextContent("Facility result received: Fit")
  expect(status).not.toHaveTextContent("Contact facility")
  expect(steps[2]).toHaveTextContent("Complete")
  expect(steps[2]).not.toHaveAttribute("aria-current")
  expect(steps[3]).toHaveAttribute("aria-current", "step")
  expect(within(controls).getAllByRole("button")).toHaveLength(1)
  await user.click(
    within(controls).getByRole("button", {
      name: "Approve council decision",
    })
  )
  const councilApproval = screen.getByRole("dialog", {
    name: "Council decision approved",
  })
  expect(
    councilApproval.querySelectorAll(".fitness-confetti-piece")
  ).toHaveLength(12)
  await user.click(
    within(councilApproval).getByRole("button", { name: "Continue" })
  )
  expect(
    screen.getByRole("link", { name: "View Fitness Certificate" })
  ).toHaveAttribute("href", "/business/fitness/certificate")
  const approvedContact = within(status).getByRole("button", {
    name: "Contact facility",
  })
  expect(approvedContact).toHaveClass("border-border")
  const approvedActions = approvedContact.closest('[data-slot="alert-action"]')
  expect(approvedActions).toHaveClass("md:absolute", "md:right-3")
  expect(
    Array.from(approvedActions!.querySelectorAll("button, a")).map(
      (action) => action.textContent
    )
  ).toEqual(["Contact facility", "View Fitness Certificate"])
  await user.click(approvedContact)
  const approvedFacilityDialog = screen.getByRole("dialog", {
    name: "Contact facility",
  })
  expect(
    within(approvedFacilityDialog).getByText("Port Harcourt City Health Centre")
  ).toBeVisible()
  expect(
    within(approvedFacilityDialog).getByRole("link", {
      name: "0803 555 0140",
    })
  ).toHaveAttribute("href", "tel:08035550140")
  await user.click(
    within(approvedFacilityDialog).getByRole("button", { name: "Close" })
  )
  expect(steps[3]).toHaveTextContent("Complete")
  expect(steps[3]).not.toHaveAttribute("aria-current")
  expect(within(controls).queryByRole("button")).not.toBeInTheDocument()
  expect(within(controls).getByText("Flow complete")).toBeVisible()
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
