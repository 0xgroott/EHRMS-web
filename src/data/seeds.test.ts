import { describe, expect, it } from "vitest"
import { seedDatabase } from "./seeds"

const premisesStatuses = [
  "Compliant",
  "Pending",
  "Non-compliant",
  "Expiring soon",
  "Suspended",
] as const

describe("premises seed data", () => {
  it("gives every business a canonical status and complete contact details", () => {
    expect(
      seedDatabase.premises.every(
        (premises) =>
          premisesStatuses.includes(premises.complianceStatus) &&
          Boolean(premises.email) &&
          Boolean(premises.phone)
      )
    ).toBe(true)
    expect(
      new Set(seedDatabase.premises.map((item) => item.complianceStatus))
    ).toEqual(new Set(premisesStatuses))
  })

  it("assigns KYB verification independently across all compliance states", () => {
    expect(
      seedDatabase.premises.every(
        (premises) => typeof premises.kybVerified === "boolean"
      )
    ).toBe(true)
    expect(
      new Set(
        seedDatabase.premises
          .filter((premises) => premises.kybVerified)
          .map((premises) => premises.complianceStatus)
      )
    ).toEqual(new Set(premisesStatuses))
  })

  it("gives every premises a complete read-only profile and photo summary", () => {
    for (const premises of seedDatabase.premises) {
      expect(premises.profile).toMatchObject({
        contactName: expect.any(String),
        premisesName: expect.any(String),
        registrationNumber: expect.any(String),
        links: { website: expect.stringMatching(/^https:\/\//) },
      })
      expect(premises.profile.photos).toHaveLength(3)
      expect(premises.profile.photos.every((photo) => photo.name)).toBe(true)
    }
    expect(
      seedDatabase.premises.find((premises) => premises.id === "PR-001")
        ?.businessProfileId
    ).toBe("BUS-001")
    expect(seedDatabase.schemaVersion).toBe(4)
  })
})
