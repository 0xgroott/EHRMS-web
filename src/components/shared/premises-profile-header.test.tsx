import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { seedDatabase } from "@/data/seeds"
import { StatusBadge } from "./status-badge"
import { PremisesProfileHeader } from "./premises-profile-header"

const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!

describe("PremisesProfileHeader", () => {
  it("presents the premises identity and available contact details", () => {
    render(
      <PremisesProfileHeader
        premises={premises}
        status={<StatusBadge status={premises.complianceStatus} />}
      />
    )

    expect(
      screen.getByRole("region", {
        name: "Borokiri Community Clinic profile",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Borokiri Community Clinic",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("img", { name: "Borokiri Community Clinic premises" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Borokiri Clinic")).not.toBeInTheDocument()
    expect(screen.getByText("Clinic")).toBeInTheDocument()
    expect(screen.getByText("Borokiri")).toBeInTheDocument()
    expect(screen.getByText("4 Harold Wilson Drive")).toBeInTheDocument()
    expect(screen.getByText("PR-015")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "contact@borokiriclinic.ng" })
    ).toHaveAttribute("href", "mailto:contact@borokiriclinic.ng")
    expect(screen.getByRole("link", { name: "0803 555 0115" })).toHaveAttribute(
      "href",
      "tel:08035550115"
    )
    expect(screen.getByText("Compliant")).toBeInTheDocument()
    expect(screen.getByLabelText("KYB verified")).toBeVisible()
  })

  it("does not render empty contact links", () => {
    render(
      <PremisesProfileHeader
        premises={{ ...premises, email: undefined, phone: undefined }}
      />
    )

    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("aligns the 64px avatar with the simplified business identity", () => {
    const { container } = render(<PremisesProfileHeader premises={premises} />)

    expect(
      container.querySelector('[data-slot="premises-profile-banner"]')
    ).toHaveClass("bg-[var(--background-brand-weak)]")
    expect(
      screen.getByRole("img", {
        name: "Borokiri Community Clinic premises",
      })
    ).toHaveAttribute("data-size", "2xl")
    expect(
      screen.getByRole("heading", { name: "Borokiri Community Clinic" })
    ).toHaveClass("text-3xl")
    expect(
      container.querySelector('[data-slot="premises-profile-identity"]')
    ).toHaveClass("items-center")
    expect(
      container.querySelector('[data-slot="premises-profile-metadata"]')
    ).toHaveTextContent("Clinic·BorokiriPR-015")
  })
})
