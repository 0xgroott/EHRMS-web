import { render, screen } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FumigationProvider } from "./fumigation-context"
import { FumigationPaymentReceiptPage } from "./fumigation-payment-receipt-page"
import { createFumigationStore } from "./fumigation-store"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

beforeEach(() => localStorage.clear())

it("shows the fumigation payment receipt with download as its only action", () => {
  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-1",
      premisesName: "Riverside Kitchen",
      requestedPeriod: "2026-10",
      declaration: true,
      providerId: "clearfield-environmental",
      totalNgn: 45000,
      paymentReference: "FUM-PAY-1",
      stage: "awaiting-provider",
    },
  })

  render(
    <FumigationProvider>
      <FumigationPaymentReceiptPage />
    </FumigationProvider>
  )

  expect(
    screen.getByRole("heading", { name: "Fumigation payment receipt" })
  ).toBeVisible()
  expect(
    screen.getByTitle("Fumigation payment receipt document")
  ).toHaveAttribute("srcdoc", expect.stringContaining("FUM-PAY-1"))
  expect(screen.getByRole("button", { name: "Download receipt" })).toBeVisible()
  expect(screen.getAllByRole("button")).toHaveLength(1)
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
})
