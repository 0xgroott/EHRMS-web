import { render, screen } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { BusinessApplicationsPage } from "./fitness-application-page"
import { BusinessCertificatesPage } from "./fitness-certificate-page"
import { FitnessProvider } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"
import { FumigationProvider } from "@/features/fumigation/fumigation-context"
import { createFumigationStore } from "@/features/fumigation/fumigation-store"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))
beforeEach(() => localStorage.clear())

it("shows an active Fitness summary and Fumigation start action", async () => {
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
      <FumigationProvider>
        <BusinessApplicationsPage />
      </FumigationProvider>
    </FitnessProvider>
  )
  expect(await screen.findByText("Awaiting facility result")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "Track Fitness application" })
  ).toHaveAttribute("href", "/business/fitness/tracker")
  expect(
    screen.getByRole("link", { name: "Start Fumigation application" })
  ).toHaveAttribute("href", "/business/fumigation/apply")
})

it("shows issued Fitness and Fumigation certificates in certificates navigation", async () => {
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
  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-1",
      requestedPeriod: "2026-10",
      declaration: true,
      stage: "issued",
      providerId: "clearfield-environmental",
      totalNgn: 45000,
      paymentReference: "FUM-PAY-1",
      workDate: "2026-10-03",
      certificate: {
        id: "FUM-CERT-1",
        councilId: "phc",
        workDate: "2026-10-03",
        issuedAt: "2026-10-04T00:00:00Z",
        expiresAt: "2027-10-04T00:00:00Z",
      },
    },
  })
  render(
    <FitnessProvider>
      <FumigationProvider>
        <BusinessCertificatesPage />
      </FumigationProvider>
    </FitnessProvider>
  )
  expect(await screen.findByText("FIT-CERT")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "View Fitness Certificate" })
  ).toHaveAttribute("href", "/business/fitness/certificate")
  expect(screen.getByText("FUM-CERT-1")).toBeVisible()
  expect(
    screen.getByRole("link", { name: "View Fumigation Certificate" })
  ).toHaveAttribute("href", "/business/fumigation/certificate")
})
