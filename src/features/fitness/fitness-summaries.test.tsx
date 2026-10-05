import { render } from "@/test/render-with-router"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
  const applications = await screen.findByRole("region", {
    name: "Current applications",
  })
  const fitnessCard = within(applications).getByRole("region", {
    name: "Fitness application",
  })
  const fumigationCard = within(applications).getByRole("region", {
    name: "Fumigation application",
  })
  expect(fitnessCard).toHaveTextContent("Awaiting facility result")
  expect(
    within(fitnessCard).getByText("Awaiting facility result")
  ).toHaveAttribute("data-tone", "pending")
  expect(
    within(fitnessCard).getByText("Awaiting facility result")
  ).toHaveAttribute("data-variant", "warning")
  expect(
    within(fitnessCard).getByRole("link", { name: "View Application" })
  ).toHaveAttribute("href", "/business/fitness/tracker")
  expect(
    within(fumigationCard).getByRole("link", { name: "View Application" })
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
  const fitnessCard = screen.getByRole("region", {
    name: "Fitness application",
  })
  expect(within(fitnessCard).getByText("Approved")).toHaveAttribute(
    "data-tone",
    "success"
  )
  expect(within(fitnessCard).getByText("Approved")).toHaveAttribute(
    "data-variant",
    "success"
  )
  expect(
    within(fitnessCard).getByRole("link", { name: "View Application" })
  ).toHaveAttribute("href", "/business/fitness/tracker")
})

it("does not add a food-handler action to an approved application", async () => {
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
    await screen.findByRole("region", { name: "Fitness application" })
  ).toBeVisible()
  expect(
    screen.queryByRole("link", { name: "Add new food handler" })
  ).not.toBeInTheDocument()
})

it("shows exactly three visual certificate cards", async () => {
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
  const view = render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <BusinessCertificatesPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )
  expect(await screen.findByText("FIT-CERT")).toBeVisible()
  const fitnessCertificateCard = screen.getByRole("region", {
    name: "Fitness Certificate",
  })
  expect(fitnessCertificateCard).toHaveAttribute(
    "data-certificate-kind",
    "fitness"
  )
  expect(
    within(fitnessCertificateCard).queryByText(/Health clearance/i)
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole("link", { name: "Open Fitness Certificate FIT-CERT" })
  ).toMatchObject({
    target: "_blank",
  })
  expect(
    screen.getByRole("link", { name: "Open Fitness Certificate FIT-CERT" })
  ).toHaveAttribute("href", "/business/fitness/certificate")
  expect(screen.getByText("FUM-CERT-1")).toBeVisible()
  expect(
    screen.getByRole("link", {
      name: "Open Fumigation Certificate FUM-CERT-1",
    })
  ).toHaveAttribute("href", "/business/fumigation/certificate")
  expect(
    within(screen.getByRole("region", { name: "Health Approval" })).queryByRole(
      "link"
    )
  ).not.toBeInTheDocument()
  expect(view.container.querySelectorAll('[data-slot="card"]')).toHaveLength(3)
  expect(screen.getByRole("region", { name: "Health Approval" })).toHaveClass(
    "md:col-span-2"
  )
})

it("uses pending and not-applied Fitness states and opens the Health Approval checklist", async () => {
  const user = userEvent.setup()
  const emptyView = render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <BusinessCertificatesPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )
  const emptyFitnessCard = await screen.findByRole("region", {
    name: "Fitness Certificate",
  })
  expect(within(emptyFitnessCard).queryByRole("link")).not.toBeInTheDocument()
  expect(emptyFitnessCard).toHaveTextContent("Not issued")
  expect(emptyFitnessCard).not.toHaveTextContent("Not started")
  const emptyFumigationCard = screen.getByRole("region", {
    name: "Fumigation Certificate",
  })
  expect(
    within(emptyFumigationCard).queryByRole("link")
  ).not.toBeInTheDocument()
  expect(emptyFumigationCard).toHaveTextContent("Not issued")
  expect(emptyFumigationCard).not.toHaveTextContent("Not started")
  expect(
    within(screen.getByRole("region", { name: "Health Approval" })).queryByRole(
      "link"
    )
  ).not.toBeInTheDocument()
  expect(
    screen.getByRole("region", { name: "Health Approval" })
  ).toHaveTextContent("Not issued")
  expect(
    screen.getByRole("region", { name: "Health Approval" })
  ).not.toHaveTextContent("Awaiting eligibility")

  await user.click(screen.getByRole("button", { name: "View checklist" }))
  const checklist = screen.getByRole("dialog", {
    name: "Health Approval checklist",
  })
  expect(
    within(checklist).getByRole("list", { name: "Health Approval steps" })
  ).toBeVisible()
  expect(within(checklist).getAllByRole("listitem")).toHaveLength(4)
  await user.keyboard("{Escape}")
  emptyView.unmount()

  createFitnessStore().write("BUS-001", {
    handlers: [],
    application: {
      id: "fitness-application-1",
      handlerIds: [],
      stage: "awaiting-facility",
    },
  })
  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-1",
      requestedPeriod: "October 2026",
      declaration: true,
      stage: "review",
    },
  })
  const pendingView = render(
    <FitnessProvider>
      <FumigationProvider>
        <InspectionProvider>
          <BusinessCertificatesPage />
        </InspectionProvider>
      </FumigationProvider>
    </FitnessProvider>
  )
  const pendingFitnessCard = await screen.findByRole("region", {
    name: "Fitness Certificate",
  })
  expect(within(pendingFitnessCard).queryByRole("link")).not.toBeInTheDocument()
  expect(pendingFitnessCard).toHaveTextContent("Not issued")
  expect(pendingFitnessCard).not.toHaveTextContent("fitness-application-1")
  expect(pendingFitnessCard).not.toHaveTextContent("Awaiting facility result")
  const draftFumigationCard = screen.getByRole("region", {
    name: "Fumigation Certificate",
  })
  expect(
    within(draftFumigationCard).queryByRole("link")
  ).not.toBeInTheDocument()
  expect(draftFumigationCard).toHaveTextContent("Not issued")
  expect(draftFumigationCard).not.toHaveTextContent("Ready for payment")
  expect(draftFumigationCard).not.toHaveTextContent("fumigation-application-1")
  pendingView.unmount()

  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-1",
      requestedPeriod: "October 2026",
      declaration: true,
      stage: "awaiting-provider",
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
  const submittedFumigationCard = await screen.findByRole("region", {
    name: "Fumigation Certificate",
  })
  expect(
    within(submittedFumigationCard).queryByRole("link")
  ).not.toBeInTheDocument()
  expect(submittedFumigationCard).toHaveTextContent("Not issued")
  expect(submittedFumigationCard).not.toHaveTextContent(
    "fumigation-application-1"
  )
  expect(submittedFumigationCard).not.toHaveTextContent(
    "Awaiting provider report"
  )
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
        submittedAt: "2026-08-28T09:30:00.000Z",
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
        submittedAt: "2026-08-29T10:15:00.000Z",
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
    await screen.findByRole("heading", { name: "Application History" })
  ).toBeVisible()
  const applicationHistory = screen.getByRole("table", {
    name: "Application History",
  })
  expect(
    within(applicationHistory)
      .getAllByRole("columnheader")
      .map((header) => header.textContent)
  ).toEqual(["Application Type", "Reference ID", "Submitted", "Status"])
  expect(
    within(applicationHistory).getByText("Fitness application")
  ).toBeVisible()
  expect(
    within(applicationHistory).getByText("Fumigation application")
  ).toBeVisible()
  expect(
    within(applicationHistory).getByText("fitness-application-1")
  ).toBeVisible()
  expect(
    within(applicationHistory).getByText("fumigation-application-1")
  ).toBeVisible()
  expect(within(applicationHistory).getByText("28 Aug 2026")).toBeVisible()
  expect(within(applicationHistory).getByText("29 Aug 2026")).toBeVisible()
  expect(within(applicationHistory).getAllByText("Approved")).toHaveLength(2)
  for (const badge of within(applicationHistory).getAllByText("Approved")) {
    expect(badge).toHaveAttribute("data-variant", "success")
  }
  expect(
    screen.queryByRole("heading", { name: "Fumigation application history" })
  ).not.toBeInTheDocument()
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
  expect(await screen.findByText("FIT-CERT-1")).toBeVisible()
  expect(screen.getByText("FUM-CERT-1")).toBeVisible()
  expect(
    certificateView.container.querySelectorAll('[data-slot="card"]')
  ).toHaveLength(3)
  expect(
    screen.queryByRole("heading", { name: "Previous Fitness certificates" })
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole("heading", {
      name: "Previous Fumigation certificates",
    })
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole("button", { name: "Download certificate" })
  ).not.toBeInTheDocument()
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
