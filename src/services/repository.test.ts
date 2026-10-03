import { describe, expect, it } from "vitest"
import { createRepository } from "./repository"
import { createStorage } from "./storage"

describe("mock repository", () => {
  it("filters premises by one of the canonical business statuses", async () => {
    const result = await createRepository(createStorage()).listPremises({
      status: "Pending",
    })
    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every((record) => record.complianceStatus === "Pending")
    ).toBe(true)
  })

  it("filters work by role and council", async () => {
    const result = await createRepository(createStorage()).listWorkItems(
      "eho",
      "phc"
    )
    expect(
      result.every(
        (item) =>
          item.councilId === "phc" && item.permittedRoles.includes("eho")
      )
    ).toBe(true)
  })
})
