import { describe, expect, it } from "vitest"
import { validateFinanceSearch } from "./lga-finance-filters"

describe("finance search", () => {
  it("keeps valid filters for detail and return links", () => {
    const filters = {
      ward: "Diobu",
      service: "Fitness",
      from: "2026-09-01",
      to: "2026-10-01",
    }
    expect(validateFinanceSearch(filters)).toEqual(filters)
  })
  it("drops malformed filters and impossible dates", () => {
    expect(
      validateFinanceSearch({
        ward: [],
        service: "unknown",
        from: "2026-02-30",
        to: "bad",
      })
    ).toEqual({
      ward: undefined,
      service: undefined,
      from: undefined,
      to: undefined,
    })
    expect(validateFinanceSearch({ ward: "all" }).ward).toBeUndefined()
  })
})
