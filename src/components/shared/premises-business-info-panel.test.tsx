import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { seedDatabase } from "@/data/seeds"
import { PremisesBusinessInfoPanel } from "./premises-business-info-panel"

describe("PremisesBusinessInfoPanel", () => {
  it("shows business and premises record fields outside the overview card", () => {
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!
    render(<PremisesBusinessInfoPanel premises={premises} />)

    expect(
      screen.getByRole("region", { name: "Business information" })
    ).toBeVisible()
    expect(screen.getByText("Compliant")).toBeVisible()
    expect(screen.getByText("Clinic")).toBeVisible()
    expect(screen.getByText("Borokiri")).toBeVisible()
    expect(screen.getByText("PR-015")).toBeVisible()
    expect(screen.getAllByText("Borokiri Clinic")).toHaveLength(2)
    expect(screen.getByText("Ibiwari George")).toBeVisible()
    expect(screen.getByText("RC-710015")).toBeVisible()
    expect(screen.getByText("Port Harcourt City")).toBeVisible()
    expect(screen.getByRole("link", { name: "Website" })).toHaveAttribute(
      "target",
      "_blank"
    )
  })
})
