import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ONBOARDING_BUSINESS_CREDENTIALS } from "@/data/business-seeds"
import { FreshRegistrationAccess } from "./fresh-registration-access"

describe("FreshRegistrationAccess", () => {
  it("shows the reusable credentials and a sign-in action", () => {
    render(
      <FreshRegistrationAccess
        signInLink={<a href="/business/sign-in">Go to sign in</a>}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Start a fresh registration" })
    ).toBeVisible()
    expect(
      screen.getByText(ONBOARDING_BUSINESS_CREDENTIALS.email)
    ).toBeVisible()
    expect(
      screen.getByText(ONBOARDING_BUSINESS_CREDENTIALS.password)
    ).toBeVisible()
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute(
      "href",
      "/business/sign-in"
    )
  })
})
