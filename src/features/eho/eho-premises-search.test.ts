import { describe, expect, it } from "vitest"
import {
  belongsToOtherCouncil,
  readRecentPremises,
  referenceFromCode,
  saveRecentPremises,
  searchPremises,
} from "./eho-premises-search"

describe("EHO premises lookup", () => {
  it("searches council records by name, reference and address", () => {
    expect(searchPremises("Riverside", "phc").map((item) => item.id)).toEqual([
      "PR-001",
    ])
    expect(searchPremises("PR-002", "phc").map((item) => item.id)).toEqual([
      "PR-002",
    ])
    expect(searchPremises("Aggrey", "phc").map((item) => item.id)).toEqual([
      "PR-004",
    ])
    expect(searchPremises("", "phc")).toEqual([])
  })

  it("does not expose another council's record in search results", () => {
    expect(searchPremises("Rumuokoro", "phc")).toEqual([])
    expect(belongsToOtherCouncil("PR-005", "phc")).toBe(true)
    expect(belongsToOtherCouncil("Rumuokoro", "phc")).toBe(false)
  })

  it("accepts a premises code or a premises URL", () => {
    expect(referenceFromCode("pr-001")).toBe("PR-001")
    expect(referenceFromCode("https://example.test/premises/PR-002?x=1")).toBe(
      "PR-002"
    )
    expect(referenceFromCode("not a code")).toBeNull()
  })

  it("keeps recent premises scoped to each officer", () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value)
      },
    }
    saveRecentPremises(storage, "EHO-001", "PR-001")
    saveRecentPremises(storage, "EHO-001", "PR-002")
    saveRecentPremises(storage, "EHO-001", "PR-001")
    expect(readRecentPremises(storage, "EHO-001")).toEqual(["PR-001", "PR-002"])
    expect(readRecentPremises(storage, "EHO-002")).toEqual([])
    values.set("ehrcms:eho:recent-premises:v1:EHO-001", "{broken")
    expect(readRecentPremises(storage, "EHO-001")).toEqual([])
  })
})
