import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHeader } from "./page-header"

describe("PageHeader", () => {
  it("shows the page title without the old eyebrow label", () => {
    render(
      <PageHeader
        eyebrow="Business portal"
        title="Applications"
        description="Prepare and track your applications."
      />
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "Applications" })
    ).toBeVisible()
    expect(screen.queryByText("Business portal")).not.toBeInTheDocument()
  })
})
