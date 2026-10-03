import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { VerifiedBusinessName } from "./verified-business-name"

describe("VerifiedBusinessName", () => {
  it("shows an accessible KYB mark for a verified business", () => {
    render(<VerifiedBusinessName name="Riverside Kitchen" verified />)

    expect(screen.getByText("Riverside Kitchen")).toBeVisible()
    expect(
      screen.getByLabelText("KYB verified").querySelector("title")
    ).toHaveTextContent("KYB verified")
  })

  it("renders an unverified business name without a verification mark", () => {
    render(<VerifiedBusinessName name="Creek View Bakery" verified={false} />)

    expect(screen.getByText("Creek View Bakery")).toBeVisible()
    expect(screen.queryByLabelText("KYB verified")).not.toBeInTheDocument()
  })
})
