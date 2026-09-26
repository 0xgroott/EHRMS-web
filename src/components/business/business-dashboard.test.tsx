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
  it("uses the business avatar in the Your business card", () => {
    render(
      <BusinessDashboard
        state={returningBusinessState}
        businessAvatar="data:image/webp;base64,BUSINESS"
      />
    )

    const avatar = screen
      .getByLabelText("Business profile")
      .querySelector('[data-slot="avatar-image"]')
    expect(avatar).toHaveAttribute("src", "data:image/webp;base64,BUSINESS")
    expect(avatar).toHaveAttribute("alt", "Riverside Kitchen & Foods logo")
  })

  it("shows the business snapshot and opens exactly two certificate choices", async () => {
    const user = userEvent.setup()
    render(<BusinessDashboard state={returningBusinessState} />)
    expect(
      screen.getByRole("heading", { level: 1, name: "Business dashboard" })
    ).toBeInTheDocument()
    expect(screen.getByText("Riverside Kitchen & Foods")).toBeInTheDocument()
    expect(screen.queryByText(/12 Abonnema Wharf Road/)).not.toBeInTheDocument()
    expect(screen.getByText("Profile complete")).toBeInTheDocument()
    expect(
      screen.queryByText("Registration and premises information")
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute(
      "href",
      "/business/settings"
    )
    expect(screen.getByText("Kitchen staff")).toBeVisible()
    expect(screen.getByText("Branches")).toBeVisible()
    expect(screen.getByText("Registered business locations")).toBeVisible()
    expect(screen.getByText("Certificates issued")).toBeVisible()
    expect(
      within(
        screen.getByText("Certificates issued").closest('[data-slot="card"]')!
      ).getByText("0")
    ).toBeVisible()
    expect(
      screen.queryByText("Your path to final Health Approval")
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Get started" }))
    const dialog = screen.getByRole("dialog", { name: "Choose a certificate" })
    expect(within(dialog).getAllByRole("link")).toHaveLength(2)
    expect(within(dialog).getByText("Health Fitness Certificate")).toBeVisible()
    expect(within(dialog).getByText("Fumigation Certificate")).toBeVisible()
    expect(
      within(dialog).getByRole("link", { name: /add kitchen staff/i })
    ).toHaveAttribute("href", "/business/food-handlers")
    expect(
      within(dialog).getByRole("link", { name: /begin fumigation/i })
    ).toHaveAttribute("href", "/business/fumigation/apply")
  })
  it("shows ten staff per page with active, archived, and Fitness test status", async () => {
    const user = userEvent.setup()
    const handlers = Array.from({ length: 12 }, (_, index) => ({
      ...handler,
      id: `handler-${index + 1}`,
      fullName: `Staff member ${index + 1}`,
      ...(index === 11 && { archivedAt: "2026-09-20T00:00:00.000Z" }),
    }))
    render(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{
          handlers,
          application: {
            id: "fitness-application-1",
            handlerIds: [handlers[0].id],
            stage: "issued",
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: [handlers[0].id],
              councilId: "phc",
              issuedAt: "2026-09-01",
              expiresAt: "2099-09-01",
            },
          },
        }}
      />
    )

    const staff = screen.getByRole("region", { name: "Staff" })
    expect(staff.querySelector('[data-slot="card"]')).not.toBeInTheDocument()
    expect(
      within(staff).queryByRole("heading", { name: "Staff" })
    ).not.toBeInTheDocument()
    expect(within(staff).getAllByRole("row")).toHaveLength(11)
    expect(within(staff).getByText("Staff member 1")).toBeVisible()
    expect(within(staff).queryByText("Staff member 11")).not.toBeInTheDocument()
    expect(within(staff).getByText("Approved")).toBeVisible()
    expect(within(staff).getAllByText("Active")).toHaveLength(10)
    const viewAllStaff = screen.getByRole("link", { name: "View all staff" })
    expect(viewAllStaff).toHaveAttribute("href", "/business/food-handlers")
    expect(
      screen.getByRole("tablist", { name: "Dashboard sections" }).parentElement
    ).toContainElement(viewAllStaff)

    await user.click(within(staff).getByRole("button", { name: "Next page" }))
    expect(within(staff).getByText("Staff member 11")).toBeVisible()
    expect(within(staff).getByText("Staff member 12")).toBeVisible()
    expect(within(staff).getByText("Archived")).toBeVisible()
    expect(within(staff).getByText("Page 2 of 2")).toBeVisible()
  })
  it("uses Staff, Certificates, and Activity as the only dashboard tabs", () => {
    render(<BusinessDashboard state={returningBusinessState} />)
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Staff",
      "Certificates",
      "Activity",
    ])
    expect(screen.getByRole("tab", { name: "Staff" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(
      screen.queryByRole("region", { name: "Certificate status" })
    ).not.toBeInTheDocument()
  })
  it("separates concise empty states into text-only dashboard tabs", async () => {
    const user = userEvent.setup()
    render(<BusinessDashboard state={returningBusinessState} />)
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Staff",
      "Certificates",
      "Activity",
    ])
    await user.click(screen.getByRole("tab", { name: "Activity" }))
    expect(screen.getByText("No recent activity")).toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "View all staff" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute(
      "href",
      "/business/settings"
    )
    await user.click(screen.getByRole("tab", { name: "Certificates" }))
    expect(screen.getByText("No certificates yet")).toBeInTheDocument()
    expect(screen.queryByText("Recent receipts")).not.toBeInTheDocument()
  })
  it("renders persisted urgent and secondary alerts with safe links", async () => {
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
    await user.click(screen.getByRole("tab", { name: "Activity" }))
    expect(screen.getByText("No recent activity")).toBeInTheDocument()
    expect(
      screen
        .getAllByRole("alert")
        .some((alert) =>
          alert.textContent.includes("2 urgent tasks need your attention")
        )
    ).toBe(true)
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
    expect(screen.getByRole("link", { name: "View profile" })).toHaveAttribute(
      "href",
      "/business/setup"
    )
    expect(screen.getByText("Profile incomplete")).toBeInTheDocument()
    expect(screen.queryByText("Non-compliant")).not.toBeInTheDocument()
  })
  it("adapts the Fitness choice from beginning to continuing", async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <BusinessDashboard
        state={returningBusinessState}
        fitness={{ handlers: [handler], application: null }}
      />
    )
    await user.click(screen.getByRole("button", { name: "Get started" }))
    let dialog = screen.getByRole("dialog", { name: "Choose a certificate" })
    expect(
      within(dialog).getByRole("link", { name: /begin health fitness/i })
    ).toHaveAttribute("href", "/business/fitness/apply")

    await user.keyboard("{Escape}")

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
    await user.click(screen.getByRole("button", { name: "Continue process" }))
    dialog = screen.getByRole("dialog", { name: "Choose a certificate" })
    expect(
      within(dialog).getByRole("link", { name: /continue health fitness/i })
    ).toHaveAttribute("href", "/business/fitness/tracker")
  })
  it("shows an issued certificate in telemetry and offers its document", async () => {
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
    expect(
      within(
        screen.getByText("Certificates issued").closest('[data-slot="card"]')!
      ).getByText("1")
    ).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Continue process" }))
    const dialog = screen.getByRole("dialog", { name: "Choose a certificate" })
    expect(
      within(dialog).getByRole("link", { name: /view health fitness/i })
    ).toHaveAttribute("href", "/business/fitness/certificate")
    expect(
      within(dialog).getByRole("link", { name: /begin fumigation/i })
    ).toHaveAttribute("href", "/business/fumigation/apply")
    expect(screen.getAllByText("Issued").length).toBeGreaterThan(0)
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("tab", { name: "Certificates" }))
    expect(screen.getByText("FIT-CERT-001")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "View certificate" })
    ).toHaveAttribute("href", "/business/fitness/certificate")
  })
  it("shows both issued certificates and opens Health Approval eligibility", () => {
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
    expect(
      within(
        screen.getByText("Certificates issued").closest('[data-slot="card"]')!
      ).getByText("2")
    ).toBeVisible()
    expect(
      screen.getByRole("heading", { name: "My Health Approval" })
    ).toBeVisible()
    expect(screen.getByText("Awaiting inspection notice")).toBeVisible()
    expect(screen.getByRole("link", { name: "View status" })).toHaveAttribute(
      "href",
      "/business/health-approval"
    )
  })

  it("shows an expired certificate in the certificate list", async () => {
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
    await user.click(screen.getByRole("button", { name: "Continue process" }))
    const dialog = screen.getByRole("dialog", { name: "Choose a certificate" })
    expect(
      within(dialog).getByRole("link", {
        name: /renew health fitness/i,
      })
    ).toHaveAttribute("href", "/business/fitness/certificate")
    expect(screen.getAllByText("Expired").length).toBeGreaterThan(0)
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("tab", { name: "Certificates" }))
    expect(screen.getByText("FIT-CERT-1")).toBeVisible()
    expect(screen.getByText("Expired")).toBeVisible()
  })

  it("lists recent activity in reverse chronological order", async () => {
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
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: [handler.id],
              councilId: "phc",
              issuedAt: "2026-09-19T00:00:00Z",
              expiresAt: "2027-09-19T00:00:00Z",
            },
          },
        }}
        inspection={{
          inspection: {
            id: "inspection-1",
            councilId: "phc",
            premisesName: "Riverside Kitchen",
            stage: "notice-acknowledged",
            notice: {
              reference: "INS-001",
              scheduledAt: "2026-09-25T09:00:00Z",
              acknowledgedAt: "2026-09-22T10:00:00Z",
            },
            findings: [],
          },
        }}
      />
    )

    await user.click(screen.getByRole("tab", { name: "Activity" }))
    const rows = within(
      screen.getByRole("table", { name: "Recent activity" })
    ).getAllByRole("row")
    expect(rows).toHaveLength(3)
    expect(rows[1]).toHaveTextContent("Inspection notice acknowledged")
    expect(rows[2]).toHaveTextContent("Fitness Certificate issued")
  })
})
