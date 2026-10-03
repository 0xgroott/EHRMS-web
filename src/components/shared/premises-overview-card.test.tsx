import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { seedDatabase } from "@/data/seeds"
import { PremisesOverviewCard } from "./premises-overview-card"

describe("PremisesOverviewCard", () => {
  it("keeps the identity and ordered contact details in the sidebar", () => {
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!
    render(<PremisesOverviewCard premises={premises} />)

    expect(
      screen.getByRole("complementary", { name: "Business overview" })
    ).toBeVisible()
    expect(
      screen.getByRole("heading", { name: "Borokiri Community Clinic" })
    ).toBeVisible()
    const overview = screen.getByRole("complementary", {
      name: "Business overview",
    })
    const details = within(overview).getByRole("region", {
      name: "Business details",
    })
    expect(
      within(details).getByRole("link", { name: "contact@borokiriclinic.ng" })
    ).toBeVisible()
    expect(
      within(details).getByRole("button", { name: "Copy email address" })
    ).toBeVisible()
    expect(
      within(details).getByRole("button", { name: "Copy phone number" })
    ).toBeVisible()
    const email = within(details).getByRole("link", {
      name: "contact@borokiriclinic.ng",
    })
    const phone = within(details).getByRole("link", { name: "0803 555 0115" })
    const address = within(details).getByText("4 Harold Wilson Drive")
    expect(email.compareDocumentPosition(phone)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(phone.compareDocumentPosition(address)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(
      within(overview).queryByText("Borokiri Clinic")
    ).not.toBeInTheDocument()
    expect(
      within(overview).queryByText("Ibiwari George")
    ).not.toBeInTheDocument()
    expect(within(overview).queryByText("RC-710015")).not.toBeInTheDocument()
    expect(within(overview).queryByText("PR-015")).not.toBeInTheDocument()
    expect(
      within(overview).queryByRole("link", { name: "Website" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /edit|upload|remove/i })
    ).not.toBeInTheDocument()
  })
})
