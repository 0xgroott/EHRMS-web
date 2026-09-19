import { render, screen } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { BusinessApplicationsPage } from "./fitness-application-page"
import { BusinessCertificatesPage } from "./fitness-certificate-page"
import { FitnessProvider } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))
beforeEach(() => localStorage.clear())

it("shows an active Fitness summary and an honest Fumigation placeholder", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [],
    application: {
      id: "demo",
      handlerIds: ["ada"],
      stage: "awaiting-facility",
      facilityId: "phc-health-centre",
      totalNgn: 12500,
      paymentReference: "DEMO-PAY",
    },
  })
  render(
    <FitnessProvider>
      <BusinessApplicationsPage />
    </FitnessProvider>
  )
  expect(await screen.findByText("Awaiting facility result")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "Track Fitness application" })
  ).toHaveAttribute("href", "/business/fitness/tracker")
  expect(screen.getByText(/Fumigation applications are coming/)).toBeVisible()
})

it("shows an issued demo Fitness certificate in certificates navigation", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [],
    application: {
      id: "demo",
      handlerIds: ["ada"],
      stage: "issued",
      certificate: {
        id: "DEMO-CERT",
        handlerIds: ["ada"],
        councilId: "phc",
        issuedAt: "2026-09-19T00:00:00Z",
        expiresAt: "2027-09-19T00:00:00Z",
      },
    },
  })
  render(
    <FitnessProvider>
      <BusinessCertificatesPage />
    </FitnessProvider>
  )
  expect(await screen.findByText("DEMO-CERT")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "View demo certificate" })
  ).toHaveAttribute("href", "/business/fitness/certificate")
  expect(screen.getByText(/Fumigation certificates are coming/)).toBeVisible()
})
