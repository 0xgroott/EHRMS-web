import { describe, expect, it } from "vitest"

import { can, visibleNavigation } from "./permissions"

describe("EHRCMS permissions", () => {
  it("reserves certificate status decisions for MOH directors", () => {
    expect(can("admin", "certificate:status-change")).toBe(false)
    expect(can("eho", "certificate:status-change")).toBe(false)
    expect(can("moh-director", "certificate:status-change")).toBe(true)
  })

  it("shows system navigation only to super admins", () => {
    expect(visibleNavigation("admin")).not.toContain("system")
    expect(visibleNavigation("super-admin")).toContain("system")
  })
})
