import { render, screen, within } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { BusinessApplicationsPage } from "./fitness-application-page"
import {
  BusinessCertificatesPage,
  FitnessCertificatePage,
} from "./fitness-certificate-page"
import { FitnessProvider } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"
import { FumigationProvider } from "@/features/fumigation/fumigation-context"
import { createFumigationStore } from "@/features/fumigation/fumigation-store"
import { FumigationCertificatePage } from "@/features/fumigation/fumigation-certificate-page"
import { InspectionProvider } from "@/features/inspection/inspection-context"
import { HealthApprovalPage } from "@/features/inspection/health-approval-page"

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
        <InspectionProvider>
          <BusinessApplicationsPage />
        </InspectionProvider>
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

it("offers a separate application when new staff join after Fitness issuance", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [
      {
        id: "ada",
        fullName: "Ada Okafor",
        role: "Cook",
        sex: "Female",
        dateOfBirth: "1990-01-01",
        identityNumber: "TEST-ADA",
        phone: "08030000000",
        premisesName: "Riverside Kitchen",
        consent: true,
      },
      {
        id: "bola",
        fullName: "Bola James",
        role: "Server",
        sex: "Female",
        dateOfBirth: "1995-01-01",
        identityNumber: "TEST-BOLA",
        phone: "08031111111",
        premisesName: "Riverside Kitchen",
        consent: true,
      },
    ],
    application: {
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
  })
  render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <BusinessApplicationsPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )

  expect(
    await screen.findByRole("button", { name: "Apply for new staff" })
  ).toBeVisible()
  expect(
    screen.getByRole("link", { name: "View Fitness Certificate or renew" })
  ).toBeVisible()
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
        <InspectionProvider>
          <BusinessCertificatesPage />
        </InspectionProvider>
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
  expect(
    screen.getByRole("link", { name: "View Health Approval" })
  ).toHaveAttribute("href", "/business/health-approval")
})

it("shows prior applications and certificates while renewals are in progress", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [],
    application: {
      id: "fitness-application-2",
      handlerIds: ["ada"],
      stage: "draft",
    },
    history: [
      {
        id: "fitness-application-1",
        handlerIds: ["ada"],
        stage: "issued",
        paymentReference: "FIT-PAY-1",
        certificate: {
          id: "FIT-CERT-1",
          handlerIds: ["ada"],
          councilId: "phc",
          issuedAt: "2026-09-01",
          expiresAt: "2099-09-01",
        },
      },
    ],
  })
  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-2",
      requestedPeriod: "October 2026",
      declaration: true,
      stage: "draft",
    },
    history: [
      {
        id: "fumigation-application-1",
        requestedPeriod: "September 2026",
        declaration: true,
        stage: "issued",
        paymentReference: "FUM-PAY-1",
        certificate: {
          id: "FUM-CERT-1",
          councilId: "phc",
          issuedAt: "2026-09-02",
          expiresAt: "2099-09-02",
          workDate: "2026-09-01",
        },
      },
    ],
  })
  const applicationView = render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <BusinessApplicationsPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )
  expect(
    await screen.findByRole("heading", { name: "Fitness application history" })
  ).toBeVisible()
  expect(screen.getByText(/Payment reference: FIT-PAY-1/)).toBeVisible()
  expect(screen.getByText(/Payment reference: FUM-PAY-1/)).toBeVisible()
  expect(
    screen.getAllByRole("button", { name: "Download payment record" })
  ).toHaveLength(2)
  applicationView.unmount()

  const certificateView = render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <BusinessCertificatesPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )
  expect(
    await screen.findByRole("heading", {
      name: "Previous Fitness certificates",
    })
  ).toBeVisible()
  expect(
    within(
      screen.getByRole("region", { name: "Previous Fitness certificates" })
    ).getByText(/FIT-CERT-1/)
  ).toBeVisible()
  expect(
    within(
      screen.getByRole("region", { name: "Previous Fumigation certificates" })
    ).getByText(/FUM-CERT-1/)
  ).toBeVisible()
  expect(
    screen.getAllByRole("button", { name: "Download certificate" })
  ).toHaveLength(2)
  expect(screen.queryByText("Requirements incomplete")).not.toBeInTheDocument()
  certificateView.unmount()

  render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <HealthApprovalPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )
  expect(await screen.findByText("Requirements met")).toBeVisible()
})

it("offers a way back into a renewal before its new application is saved", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [],
    application: null,
    history: [
      {
        id: "fitness-application-1",
        handlerIds: [],
        stage: "issued",
        certificate: {
          id: "FIT-CERT-1",
          handlerIds: [],
          councilId: "phc",
          issuedAt: "2026-09-01",
          expiresAt: "2099-09-01",
        },
      },
    ],
  })
  createFumigationStore().write("BUS-001", {
    application: null,
    history: [
      {
        id: "fumigation-application-1",
        requestedPeriod: "September 2026",
        declaration: true,
        stage: "issued",
        certificate: {
          id: "FUM-CERT-1",
          councilId: "phc",
          issuedAt: "2026-09-02",
          expiresAt: "2099-09-02",
          workDate: "2026-09-01",
        },
      },
    ],
  })
  const fitnessView = render(
    <FitnessProvider>
      <FitnessCertificatePage />
    </FitnessProvider>
  )
  expect(
    await screen.findByRole("link", { name: "Continue renewal" })
  ).toHaveAttribute("href", "/business/fitness/apply")
  fitnessView.unmount()

  render(
    <FumigationProvider>
      <FumigationCertificatePage />
    </FumigationProvider>
  )
  expect(
    await screen.findByRole("link", { name: "Continue renewal" })
  ).toHaveAttribute("href", "/business/fumigation/apply")
})
