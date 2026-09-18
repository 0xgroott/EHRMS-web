import { expect, it } from "vitest"
import { businessRoleHandoffPath } from "./app-header"

it("hands business users to the future business dashboard", () => {
  expect(businessRoleHandoffPath("business-user")).toBe("/business/dashboard")
})

it("keeps staff roles in the current application", () => {
  expect(businessRoleHandoffPath("admin")).toBeNull()
})
