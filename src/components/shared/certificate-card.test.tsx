import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CertificateCard } from "./certificate-card"

describe("CertificateCard", () => {
  it.each([
    ["Fitness", "fitness"],
    ["Fumigation", "fumigation"],
    ["Health Approval", "health-approval"],
  ] as const)("uses the %s certificate identity", (type, identity) => {
    render(
      <CertificateCard
        type={type}
        reference={`${identity}-001`}
        expiresAt="2027-03-14"
      />
    )

    const card = screen.getByRole("region", {
      name:
        type === "Health Approval" ? "Health Approval" : `${type} Certificate`,
    })
    expect(card).toHaveAttribute("data-certificate-kind", identity)
    expect(within(card).getByRole("heading", { level: 2 })).toHaveTextContent(
      type === "Health Approval" ? "Health Approval" : `${type} Certificate`
    )
    expect(within(card).getByText(`${identity}-001`)).toBeVisible()
    expect(card).toHaveTextContent("Expires 14 March 2027")
    expect(card).toHaveClass("ring-0")
    expect(card.className).not.toContain("ring-[var(")
    expect(card.querySelector('[data-slot="certificate-seal"]')).toBeVisible()
  })

  it("opens an issued certificate viewer in a new tab from the whole card", () => {
    render(
      <CertificateCard
        type="Fitness"
        reference="FIT-2026-001"
        expiresAt="2027-03-14"
        href="/business/fitness/certificate"
      />
    )

    const link = screen.getByRole("link", {
      name: "Open Fitness Certificate FIT-2026-001",
    })
    expect(link).toHaveAttribute("href", "/business/fitness/certificate")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noreferrer")
    expect(
      link.querySelector('[data-slot="certificate-open-arrow"]')
    ).toBeVisible()
  })

  it("does not expose a link or arrow for an unfinished certificate", () => {
    render(<CertificateCard type="Fumigation" reference="FUM-APP-004" />)

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(
      screen
        .getByRole("region", { name: "Fumigation Certificate" })
        .querySelector('[data-slot="certificate-open-arrow"]')
    ).not.toBeInTheDocument()
    expect(screen.getByText("Not issued")).toBeVisible()
    expect(screen.queryByText("FUM-APP-004")).not.toBeInTheDocument()
  })
})
