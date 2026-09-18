import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { BusinessDashboard } from "./business-dashboard"

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
    ).toHaveAttribute("href", "/business/certificates")
  })
  it("shows honest empty applications, receipts, certificates and reminders", () => {
    render(<BusinessDashboard state={returningBusinessState} />)
    for (const name of [
      "No active applications",
      "No receipts yet",
      "No certificates yet",
      "No reminders yet",
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(
      screen.getByRole("link", { name: "View applications" })
    ).toHaveAttribute("href", "/business/applications")
    expect(
      screen.getByRole("link", { name: "Update business profile" })
    ).toHaveAttribute("href", "/business/profile")
  })
  it("renders persisted urgent and secondary alerts with safe links and one prioritized action", () => {
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
})
