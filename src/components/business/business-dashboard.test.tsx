import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import type { FitnessState } from "@/features/fitness/fitness-types"
import { BusinessDashboard } from "./business-dashboard"

const handler: FitnessState["handlers"][number] = {
  id: "handler-1",
  fullName: "Tari Briggs",
  sex: "Female",
  dateOfBirth: "1993-05-12",
  role: "Cook",
  identityNumber: "ID-001",
  phone: "08031230001",
  premisesName: "Riverside Kitchen",
  consent: true,
}

describe("business dashboard", () => {
  it("shows the returning business, premises, profile status and exactly one next action", () => {
    const { container } = render(
      <BusinessDashboard state={returningBusinessState} />
    )
    expect(
      screen.getByRole("heading", { level: 1, name: "Business dashboard" })
    ).toBeInTheDocument()
    expect(screen.getByText("Riverside Kitchen & Foods")).toBeInTheDocument()
    expect(screen.getByText(/12 Abonnema Wharf Road/)).toBeInTheDocument()
    expect(screen.getByText("Profile complete")).toBeInTheDocument()
    const nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(within(nextAction).getAllByRole("link")).toHaveLength(1)
    expect(
      within(nextAction).getByRole("link", { name: "Add food handlers" })
    ).toHaveAttribute("href", "/business/food-handlers")
    expect(
      container.querySelectorAll('[data-slot="button"].bg-primary')
    ).toHaveLength(1)
  })
  it("shows three certificate status cards and prerequisite guidance without a direct Health Approval application", () => {
    render(<BusinessDashboard state={returningBusinessState} />)
    const statuses = screen.getByRole("region", { name: "Certificate status" })
    expect(
      within(statuses)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual(["Fitness", "Fumigation", "Health Approval"])
    expect(
      within(statuses).getByText("Requirements incomplete")
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: /apply for health approval/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /apply for health approval/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "View Health Approval requirements" })
    ).toHaveAttribute("href", "/business/health-approval")
  })
  it("separates concise empty states into text-only dashboard tabs", async () => {
    const user = userEvent.setup()
    render(<BusinessDashboard state={returningBusinessState} />)
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Overview",
      "Activity",
      "Records",
    ])
    await user.click(screen.getByRole("tab", { name: "Activity" }))
    for (const name of ["No active applications", "No reminders yet"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(
      screen.getByRole("link", { name: "View applications" })
    ).toHaveAttribute("href", "/business/applications")
    expect(
      screen.getByRole("link", { name: "Update business profile" })
    ).toHaveAttribute("href", "/business/settings")
    await user.click(screen.getByRole("tab", { name: "Records" }))
    for (const name of ["No receipts yet", "No certificates yet"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })
  it("renders persisted urgent and secondary alerts with safe links and one prioritized action", async () => {
    const user = userEvent.setup()
    render(
      <BusinessDashboard
        state={{
          ...returningBusinessState,
          alerts: [
            {
              id: "b",
              title: "Resolve kitchen findings",
              kind: "corrective-action",
              dueAt: "2026-09-23",
              urgent: true,
              href: "https://untrusted.example",
            },
            {
              id: "a",
              title: "Acknowledge inspection",
              kind: "inspection",
              dueAt: "2026-09-20",
              urgent: true,
              href: "/business/inspections/unknown",
            },
            {
              id: "c",
              title: "Follow-up visit",
              kind: "inspection",
              dueAt: "2026-10-01",
              urgent: false,
              href: "/business/inspections",
            },
          ],
        }}
      />
    )
    const nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(
      within(nextAction).getByRole("heading", {
        name: "Acknowledge inspection",
      })
    ).toBeInTheDocument()
    expect(within(nextAction).getAllByRole("link")).toHaveLength(1)
    await user.click(screen.getByRole("tab", { name: "Activity" }))
    expect(screen.getByText("Resolve kitchen findings")).toBeInTheDocument()
    expect(screen.getByText("Follow-up visit")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent(
      "2 urgent tasks need your attention"
    )
    expect(
      screen
        .getAllByRole("link")
        .every((link) => link.getAttribute("href")?.startsWith("/business/"))
    ).toBe(true)
  })
  it("handles an incomplete profile without claiming compliance or crashing", () => {
    render(
      <BusinessDashboard
        state={{ schemaVersion: 1, stage: "setup", profile: null, alerts: [] }}
      />
    )
    expect(
      screen.getByRole("link", { name: "Complete business setup" })
    ).toHaveAttribute("href", "/business/setup")
    expect(screen.getByText("Profile incomplete")).toBeInTheDocument()
    expect(screen.queryByText("Non-compliant")).not.toBeInTheDocument()
  })
  it("moves the next action from handler registration into the Fitness journey", () => {
    const { rerender } = render(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{ handlers: [handler], application: null }}
      />
    )
    let nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(
      within(nextAction).getByRole("link", { name: /start fitness/i })
    ).toHaveAttribute("href", "/business/fitness/apply")

    rerender(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{
          handlers: [handler],
          application: {
            id: "fitness-demo-application",
            handlerIds: [handler.id],
            stage: "awaiting-facility",
            facilityId: "phc-health-centre",
            totalNgn: 12500,
            paymentReference: "DEMO-FITNESS-001",
          },
        }}
      />
    )
    nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(
      within(nextAction).getByRole("link", { name: /track fitness/i })
    ).toHaveAttribute("href", "/business/fitness/tracker")
    expect(
      screen.getAllByText(/Awaiting facility result/i).length
    ).toBeGreaterThan(0)
  })
  it("shows issued certificate and makes Fumigation next action", async () => {
    const user = userEvent.setup()
    render(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{
          handlers: [handler],
          application: {
            id: "fitness-demo-application",
            handlerIds: [handler.id],
            stage: "issued",
            facilityId: "phc-health-centre",
            totalNgn: 12500,
            paymentReference: "DEMO-FITNESS-001",
            certificate: {
              id: "DEMO-CERT-001",
              handlerIds: [handler.id],
              councilId: "phc",
              issuedAt: "2026-09-19T00:00:00.000Z",
              expiresAt: "2027-09-19T00:00:00.000Z",
            },
          },
        }}
      />
    )
    const nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(
      within(nextAction).getByRole("heading", {
        name: "Start your Fumigation application",
      })
    ).toBeInTheDocument()
    expect(screen.getByText("Issued")).toBeInTheDocument()
    expect(
      screen.getAllByRole("link", { name: /view fitness certificate/i }).length
    ).toBeGreaterThan(0)
    await user.click(screen.getByRole("tab", { name: "Records" }))
    expect(screen.getByText("FIT-CERT-001")).toBeInTheDocument()
  })
  it("opens Health Approval eligibility after both certificates are issued", () => {
    render(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{
          handlers: [handler],
          application: {
            id: "fitness-application-1",
            handlerIds: [handler.id],
            stage: "issued",
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: [handler.id],
              councilId: "phc",
              issuedAt: "2026-09-19T00:00:00Z",
              expiresAt: "2027-09-19T00:00:00Z",
            },
          },
        }}
        fumigation={{
          application: {
            id: "fumigation-application-1",
            requestedPeriod: "2026-09",
            declaration: true,
            stage: "issued",
            certificate: {
              id: "FUM-CERT-1",
              councilId: "phc",
              workDate: "2026-09-19",
              issuedAt: "2026-09-19T00:00:00Z",
              expiresAt: "2027-09-19T00:00:00Z",
            },
          },
        }}
      />
    )
    const nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(
      within(nextAction).getByRole("link", { name: "View Health Approval" })
    ).toHaveAttribute("href", "/business/health-approval")
    expect(screen.getByText("Inspection pending")).toBeInTheDocument()
  })

  it("shows an expired certificate renewal and keeps its receipt in history", async () => {
    const user = userEvent.setup()
    render(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{
          handlers: [handler],
          application: {
            id: "fitness-application-1",
            handlerIds: [handler.id],
            stage: "issued",
            paymentReference: "FIT-PAY-1",
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: [handler.id],
              councilId: "phc",
              issuedAt: "2020-01-01",
              expiresAt: "2021-01-01",
            },
          },
        }}
      />
    )
    const nextAction = screen.getByRole("region", {
      name: "Next required action",
    })
    expect(
      within(nextAction).getByRole("link", {
        name: "View certificate to renew",
      })
    ).toHaveAttribute("href", "/business/fitness/certificate")
    expect(screen.getByText("Expired")).toBeVisible()
    await user.click(screen.getByRole("tab", { name: "Activity" }))
    const reminders = screen.getByRole("region", {
      name: "Reminders and deadlines",
    })
    expect(within(reminders).getByText(/Certificate expired/)).toBeVisible()
    await user.click(screen.getByRole("tab", { name: "Records" }))
    expect(screen.getByText(/FIT-PAY-1/)).toBeVisible()
  })
})
