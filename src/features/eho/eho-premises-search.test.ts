import { describe, expect, it } from "vitest"
import {
  belongsToOtherCouncil,
  readRecentPremises,
  referenceFromCode,
  saveRecentPremises,
  searchPremises,
} from "./eho-premises-search"

describe("EHO premises lookup", () => {
  it("lists council records and searches every directory field", () => {
    expect(searchPremises("", "phc").map((item) => item.id)).toEqual([
      "PR-015",
      "PR-018",
      "PR-004",
      "PR-003",
      "PR-013",
      "PR-016",
      "PR-017",
      "PR-014",
      "PR-001",
      "PR-002",
    ])
    expect(searchPremises("Riverside", "phc").map((item) => item.id)).toEqual([
      "PR-001",
    ])
    expect(searchPremises("PR-002", "phc").map((item) => item.id)).toEqual([
      "PR-002",
    ])
    expect(searchPremises("Aggrey", "phc").map((item) => item.id)).toEqual([
      "PR-004",
    ])
    expect(searchPremises("Cold Store", "phc").map((item) => item.id)).toEqual([
      "PR-018",
      "PR-003",
    ])
  })

  it("combines ward, business type and compliance filters", () => {
    expect(
      searchPremises("", "phc", {
        ward: "Diobu",
        premisesType: "Restaurant",
        complianceStatus: "Compliant",
      }).map((item) => item.id)
    ).toEqual(["PR-001"])
    expect(
      searchPremises("", "phc", { complianceStatus: "Expiring soon" }).map(
        (item) => item.id
      )
    ).toEqual(["PR-014"])
  })

  it("sorts the directory by ward, business type or status", () => {
    expect(
      searchPremises("", "phc", { sort: "ward" }).map((item) => item.id)
    ).toEqual([
      "PR-015",
      "PR-018",
      "PR-003",
      "PR-014",
      "PR-001",
      "PR-002",
      "PR-013",
      "PR-017",
      "PR-004",
      "PR-016",
    ])
    expect(
      searchPremises("", "phc", { sort: "business-type" }).map(
        (item) => item.id
      )
    ).toEqual([
      "PR-004",
      "PR-015",
      "PR-018",
      "PR-003",
      "PR-016",
      "PR-002",
      "PR-013",
      "PR-014",
      "PR-017",
      "PR-001",
    ])
    expect(
      searchPremises("", "phc", { sort: "status" }).map((item) => item.id)
    ).toEqual([
      "PR-015",
      "PR-013",
      "PR-001",
      "PR-014",
      "PR-003",
      "PR-017",
      "PR-002",
      "PR-018",
      "PR-004",
      "PR-016",
    ])
  })

  it("provides ten distinct premises for the Port Harcourt directory", () => {
    const results = searchPremises("", "phc")

    expect(results).toHaveLength(10)
    expect(new Set(results.map((item) => item.id)).size).toBe(10)
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
