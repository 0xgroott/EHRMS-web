import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { useBusinessSession } from "./business-session"
import { useDemoSession } from "./demo-session"
import { Providers } from "./providers"

function Harness() {
  const businessSession = useBusinessSession()
  const demoSession = useDemoSession()

  return (
    <>
      <span data-testid="business-stage">{businessSession.state.stage}</span>
      <span data-testid="demo-role">{demoSession.roleLabel}</span>
    </>
  )
}

it("provides business and demo sessions together", () => {
  render(
    <Providers>
      <Harness />
    </Providers>
  )

  expect(screen.getByTestId("business-stage")).toHaveTextContent("account")
  expect(screen.getByTestId("demo-role")).toHaveTextContent("Admin")
})
