import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CertificateSummary } from "@/domain/types"
import { PremisesCertificateCards } from "./premises-certificate-cards"

const certificates: CertificateSummary[] = [
  {
    id: "FIT-2026-001",
    type: "Fitness",
    status: "Active",
    expiresAt: "2027-03-14",
  },
  {
    id: "FUM-2026-002",
    type: "Fumigation",
    status: "Expiring Soon",
    expiresAt: "2026-10-30",
  },
  {
    id: "HA-2026-003",
    type: "Health Approval",
    status: "Pending",
  },
]

describe("PremisesCertificateCards", () => {
  it("shows every certificate as an individual summary card", () => {
    const { container } = render(
      <PremisesCertificateCards certificates={certificates} />
    )

    const fitness = screen.getByRole("region", {
      name: "Fitness Certificate",
    })
    expect(fitness).toHaveAttribute("data-certificate-kind", "fitness")
    expect(within(fitness).getByText("FIT-2026-001")).toBeVisible()
    expect(within(fitness).getByText("14 March 2027")).toBeVisible()
    expect(
      within(fitness).queryByText(/Health clearance/i)
    ).not.toBeInTheDocument()

    const fumigation = screen.getByRole("region", {
      name: "Fumigation Certificate",
    })
    expect(fumigation).toHaveAttribute("data-certificate-kind", "fumigation")

    const approval = screen.getByRole("region", {
      name: "Health Approval",
    })
    expect(approval).toHaveAttribute("data-certificate-kind", "health-approval")
    expect(within(approval).getByText("Not issued")).toBeVisible()
    expect(within(approval).queryByText("HA-2026-003")).not.toBeInTheDocument()
    expect(
      approval.querySelector('[data-slot="certificate-seal"]')
    ).toBeVisible()

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(3)
    expect(
      screen.queryByRole("link", { name: /Open .* Certificate/i })
    ).not.toBeInTheDocument()
  })

  it("adds a role-specific certificate action when a destination is supplied", () => {
    render(
      <PremisesCertificateCards
        certificates={[certificates[0]]}
        getCertificateHref={(certificate) => `/records/${certificate.id}`}
      />
    )

    expect(
      screen.getByRole("link", {
        name: "Open Fitness Certificate FIT-2026-001",
      })
    ).toHaveAttribute("href", "/records/FIT-2026-001")
    expect(
      screen.getByRole("link", {
        name: "Open Fitness Certificate FIT-2026-001",
      })
    ).toHaveAttribute("target", "_blank")
  })

  it("does not link an unfinished certificate even when it has a reference", () => {
    render(
      <PremisesCertificateCards
        certificates={[certificates[2]]}
        getCertificateHref={(certificate) => `/records/${certificate.id}`}
      />
    )

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByText("Not issued")).toBeVisible()
    expect(screen.queryByText("HA-2026-003")).not.toBeInTheDocument()
  })

  it("shows the existing certificate empty state when there are no records", () => {
    render(<PremisesCertificateCards certificates={[]} />)

    expect(screen.getByText("No certificates")).toBeVisible()
    expect(
      screen.getByText("No certificate records are linked to this premises.")
    ).toBeVisible()
  })
})
