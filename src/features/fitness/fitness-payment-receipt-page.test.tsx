import { render, screen } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FitnessProvider } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"
import { FitnessPaymentReceiptPage } from "./fitness-payment-receipt-page"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

beforeEach(() => localStorage.clear())

it("shows the payment receipt document with download as its only action", () => {
  createFitnessStore().write("BUS-001", {
    handlers: [],
    application: {
      id: "fitness-application-1",
      stage: "awaiting-facility",
      handlerIds: [],
      facilityId: "phc-health-centre",
      totalNgn: 12500,
      paymentReference: "FIT-PAY-1",
    },
  })

  render(
    <FitnessProvider>
      <FitnessPaymentReceiptPage />
    </FitnessProvider>
  )

  expect(
    screen.getByRole("heading", { name: "Fitness payment receipt" })
  ).toBeVisible()
  expect(screen.getByTitle("Fitness payment receipt document")).toHaveAttribute(
    "srcdoc",
    expect.stringContaining("FIT-PAY-1")
  )
  expect(screen.getByRole("button", { name: "Download receipt" })).toBeVisible()
  expect(screen.getAllByRole("button")).toHaveLength(1)
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
})
