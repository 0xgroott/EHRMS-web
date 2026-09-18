import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it } from "vitest"
import { DemoSessionProvider, useDemoSession } from "./demo-session"

function Harness() {
  const session = useDemoSession()
  return <><span data-testid="role-label">{session.roleLabel}</span><label>Demo role<select value={session.role} onChange={(event) => session.setRole(event.target.value as typeof session.role)}><option value="admin">Admin</option><option value="super-admin">Super Admin</option></select></label></>
}

it("updates the selected demo role", async () => {
  render(<DemoSessionProvider><Harness /></DemoSessionProvider>)
  expect(screen.getByTestId("role-label")).toHaveTextContent("Admin")
  await userEvent.setup().selectOptions(screen.getByLabelText("Demo role"), "super-admin")
  expect(screen.getByTestId("role-label")).toHaveTextContent("Super Admin")
})
