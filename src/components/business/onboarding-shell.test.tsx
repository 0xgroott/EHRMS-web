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
  expect(main).toHaveClass("md:h-svh", "md:overflow-hidden")
  expect(
    within(main).getByRole("region", { name: "EHRCMS Business Portal" })
  ).toBeInTheDocument()
  expect(
    within(main).getByRole("region", { name: "EHRCMS Business Portal" })
  ).toHaveClass("md:sticky", "md:top-0", "md:h-svh", "md:overflow-hidden")
  const formRegion = within(main).getByRole("region", {
    name: "Create your account",
  })
  expect(formRegion).toHaveClass("md:h-svh", "md:overflow-y-auto")
  expect(
    within(formRegion).getByRole("button", { name: "Create account" })
  ).toBeVisible()
  const progress = screen.getByRole("navigation", {
    name: "Account setup progress",
  })
  expect(
    within(progress).getByRole("listitem", {
      name: "Step 1 of 4: Business details",
    })
  ).toHaveAttribute("aria-current", "step")
  expect(within(progress).getByText("Step 01")).toBeVisible()
  expect(within(progress).getByText("Step 02")).toBeVisible()
  expect(within(progress).getByText("Step 03")).toBeVisible()
  expect(within(progress).getByText("Step 04")).toBeVisible()
  expect(
    within(progress).queryByText("Business details")
  ).not.toBeInTheDocument()
  expect(within(progress).queryByText("Account access")).not.toBeInTheDocument()
  expect(within(progress).queryByText("Verify contact")).not.toBeInTheDocument()
  expect(
    within(progress).queryByText("Business and premises")
  ).not.toBeInTheDocument()
  expect(
    screen.getByText("Start with your contact details.")
  ).toBeInTheDocument()
})

it("supports the shorter verified onboarding journey", () => {
  render(
    <OnboardingShell
      title="Tell us who is registering"
      description="Add your details."
      step={1}
      steps={["Business identity", "Business and premises"]}
    >
      <button>Continue</button>
    </OnboardingShell>
  )

  const progress = screen.getByRole("navigation", {
    name: "Account setup progress",
  })
  expect(
    within(progress).getByRole("listitem", {
      name: "Step 1 of 2: Business identity",
    })
  ).toHaveAttribute("aria-current", "step")
  expect(within(progress).getByText("Step 01")).toBeVisible()
  expect(within(progress).getByText("Step 02")).toBeVisible()
  expect(within(progress).queryByText("Step 03")).not.toBeInTheDocument()
  expect(
    within(progress).queryByText("Business identity")
  ).not.toBeInTheDocument()
  expect(
    within(progress).queryByText("Business and premises")
  ).not.toBeInTheDocument()
})
