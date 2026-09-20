import { describe, expect, it, vi } from "vitest"
import { createFumigationStore, emptyFumigationState } from "./fumigation-store"
import type { FumigationState } from "./fumigation-types"

const saved: FumigationState = {
  application: {
    id: "fumigation-application-1",
    requestedPeriod: "September 2026",
    declaration: true,
    stage: "draft",
  },
}

describe("fumigation store", () => {
  it("persists state for a profile across store instances", () => {
    createFumigationStore(localStorage).write("business-a", saved)
    expect(createFumigationStore(localStorage).read("business-a")).toEqual(
      saved
    )
  })

  it("isolates profiles and rejects malformed saved state", () => {
    const store = createFumigationStore(localStorage)
    store.write("business-a", saved)
    expect(store.read("business-b")).toEqual(emptyFumigationState())
    localStorage.setItem("ehrcms:fumigation:v1:business-c", "{}")
    expect(store.read("business-c")).toEqual(emptyFumigationState())
  })

  it("notifies only the matching profile", () => {
    const store = createFumigationStore(localStorage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe("business-a", listener)
    store.write("business-b", saved)
    expect(listener).not.toHaveBeenCalled()
    store.write("business-a", saved)
    expect(listener).toHaveBeenCalledWith(saved)
    unsubscribe()
    store.write("business-a", emptyFumigationState())
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("rejects malformed historical certificates", () => {
    localStorage.setItem(
      "ehrcms:fumigation:v1:business-a",
      JSON.stringify({
        application: null,
        history: [
          {
            id: "old",
            requestedPeriod: "September 2026",
            declaration: true,
            stage: "issued",
            certificate: {
              id: "bad",
              councilId: "phc",
              workDate: "2026-09-01",
              issuedAt: "invalid",
              expiresAt: "invalid",
            },
          },
        ],
      })
    )
    expect(createFumigationStore(localStorage).read("business-a")).toEqual(
      emptyFumigationState()
    )
  })
})
