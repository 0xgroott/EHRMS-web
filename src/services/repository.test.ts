import { describe, expect, it } from "vitest"
import { createRepository } from "./repository"
import { createStorage } from "./storage"

describe("mock repository", () => {
  it("distinguishes Not Found from Non-compliant", async () => {
    const result = await createRepository(createStorage()).listPremises({ status: "Not Found" })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((record) => record.complianceStatus === "Not Found")).toBe(true)
  })

  it("filters work by role and council", async () => {
    const result = await createRepository(createStorage()).listWorkItems("eho", "phc")
    expect(result.every((item) => item.councilId === "phc" && item.permittedRoles.includes("eho"))).toBe(true)
  })
})
