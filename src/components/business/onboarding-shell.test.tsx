import { render, screen, within } from "@testing-library/react"
import { expect, it } from "vitest"
import { OnboardingShell } from "./onboarding-shell"

it("provides branded and form regions with the current onboarding step", () => {
  render(
    <OnboardingShell
      title="Create your account"
      description="Start with your contact details."
      step={1}
    >
      <button>Create account</button>
    </OnboardingShell>
  )
  const main = screen.getByRole("main")
  expect(
    within(main).getByRole("region", { name: "EHRCMS Business Portal" })
  ).toBeInTheDocument()
  const formRegion = within(main).getByRole("region", {
    name: "Create your account",
  })
  expect(
    within(formRegion).getByRole("button", { name: "Create account" })
  ).toBeVisible()
  expect(screen.getByText("Account")).toHaveAttribute("aria-current", "step")
  expect(
    screen.getByText("Start with your contact details.")
  ).toBeInTheDocument()
})
