import { expect, it, vi } from "vitest"
import { handleDemoRoleSelection } from "./app-header"

it("selecting Business User updates the role and navigates once", () => {
  const setRole = vi.fn()
  const navigate = vi.fn()

  handleDemoRoleSelection("business-user", setRole, navigate)

  expect(setRole).toHaveBeenCalledOnce()
  expect(setRole).toHaveBeenCalledWith("business-user")
  expect(navigate).toHaveBeenCalledOnce()
  expect(navigate).toHaveBeenCalledWith("/business/dashboard")
})

it("selecting a staff role updates the role without business navigation", () => {
  const setRole = vi.fn()
  const navigate = vi.fn()

  handleDemoRoleSelection("admin", setRole, navigate)

  expect(setRole).toHaveBeenCalledOnce()
  expect(setRole).toHaveBeenCalledWith("admin")
  expect(navigate).not.toHaveBeenCalled()
})
