import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { seedDatabase } from "@/data/seeds"
import { resolvePremisesProfile } from "./premises-profile-data"
import { PremisesDocumentsPanel } from "./premises-documents-panel"

describe("PremisesDocumentsPanel", () => {
  it("shows supporting documents and read-only premises photos", () => {
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!
    const profile = resolvePremisesProfile(premises, null)
    render(
      <PremisesDocumentsPanel
        businessName={premises.businessName}
        documents={premises.documents}
        photos={profile.photos}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Supporting documents" })
    ).toBeVisible()
    expect(screen.getByText("Premises registration")).toBeVisible()
    expect(
      screen.getByRole("heading", { name: "Premises and kitchen photos" })
    ).toBeVisible()
    expect(screen.getAllByRole("img")).toHaveLength(3)
    expect(screen.getByText("3 photos")).toBeVisible()
    expect(
      screen.queryByRole("button", { name: /upload|replace|remove/i })
    ).not.toBeInTheDocument()
  })
})
