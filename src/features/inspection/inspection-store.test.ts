import { describe, expect, it, vi } from "vitest"
import { createInspectionStore, emptyInspectionState } from "./inspection-store"
import type { InspectionState } from "./inspection-types"

const saved: InspectionState = {
  inspection: {
    id: "inspection-1",
    councilId: "phc",
    premisesName: "Riverside Kitchen",
    stage: "notice-served",
    notice: {
      reference: "INS-NOTICE-INSPECTION-1",
      scheduledAt: "2026-09-20T10:00:00.000Z",
    },
    findings: [],
  },
}

describe("inspection store", () => {
  it("persists an inspection for one profile across store instances", () => {
    createInspectionStore(localStorage).write("business-a", saved)
    expect(createInspectionStore(localStorage).read("business-a")).toEqual(
      saved
    )
    expect(createInspectionStore(localStorage).read("business-b")).toEqual(
      emptyInspectionState()
    )
  })

  it("rejects malformed saved state", () => {
    localStorage.setItem(
      "ehrcms:inspection:v1:business-c",
      JSON.stringify({ inspection: { stage: "issued" } })
    )
    expect(createInspectionStore(localStorage).read("business-c")).toEqual(
      emptyInspectionState()
    )
  })

  it("notifies only subscribers for the matching profile", () => {
    const store = createInspectionStore(localStorage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe("business-a", listener)
    store.write("business-b", saved)
    expect(listener).not.toHaveBeenCalled()
    store.write("business-a", saved)
    expect(listener).toHaveBeenCalledWith(saved)
    unsubscribe()
    store.write("business-a", emptyInspectionState())
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
