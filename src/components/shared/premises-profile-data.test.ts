import { beforeEach, describe, expect, it } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { seedDatabase } from "@/data/seeds"
import { STORAGE_KEY } from "@/services/business-storage"
import { businessMediaStorageKey } from "@/features/business-media/business-media-store"
import { resolvePremisesProfile } from "./premises-profile-data"

describe("resolvePremisesProfile", () => {
  beforeEach(() => localStorage.clear())

  it("uses complete seeded profile data when no linked settings are saved", () => {
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!

    expect(resolvePremisesProfile(premises, localStorage)).toMatchObject({
      businessName: "Borokiri Community Clinic",
      premisesName: expect.any(String),
      contactName: expect.any(String),
      registrationNumber: expect.any(String),
      email: "contact@borokiriclinic.ng",
      photos: expect.arrayContaining([
        expect.objectContaining({ name: expect.any(String) }),
      ]),
    })
  })

  it("prefers matching saved business settings and uploaded media", () => {
    const premises = seedDatabase.premises.find((item) => item.id === "PR-001")!
    const saved = structuredClone(returningBusinessState)
    saved.profile!.contactName = "Adaeze Okafor"
    saved.profile!.premises!.registrationNumber = "RC-889201"
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    localStorage.setItem(
      businessMediaStorageKey("BUS-001"),
      JSON.stringify({
        avatar: {
          name: "riverside-logo.webp",
          dataUrl: "data:image/webp;base64,AAAA",
        },
        photos: [
          {
            name: "riverside-kitchen.webp",
            dataUrl: "data:image/webp;base64,BBBB",
          },
          null,
          null,
        ],
      })
    )

    expect(resolvePremisesProfile(premises, localStorage)).toMatchObject({
      contactName: "Adaeze Okafor",
      registrationNumber: "RC-889201",
      avatar: {
        name: "riverside-logo.webp",
        dataUrl: "data:image/webp;base64,AAAA",
      },
      photos: [
        {
          name: "riverside-kitchen.webp",
          dataUrl: "data:image/webp;base64,BBBB",
        },
      ],
    })
  })

  it("ignores saved data for an unrelated business profile", () => {
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returningBusinessState))

    expect(resolvePremisesProfile(premises, localStorage).businessName).toBe(
      "Borokiri Community Clinic"
    )
  })
})
