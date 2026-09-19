import { describe, expect, it, vi } from "vitest"
import { createFitnessStore, fitnessStorageKey } from "./fitness-store"
import type { FitnessState } from "./fitness-types"

const savedState: FitnessState = {
  handlers: [
    {
      id: "handler-ada",
      fullName: "Ada Okafor",
      sex: "Female",
      dateOfBirth: "1991-04-12",
      role: "Kitchen assistant",
      identityNumber: "NIN-12345678901",
      phone: "08030000000",
      premisesName: "Riverside Kitchen & Foods",
      consent: true,
    },
  ],
  application: null,
}

describe("fitness store", () => {
  it("persists fitness state for reload", () => {
    const firstStore = createFitnessStore(localStorage)
    firstStore.write("business-a", savedState)

    expect(createFitnessStore(localStorage).read("business-a")).toEqual(
      savedState
    )
  })

  it("keeps one business profile's fitness demo separate from another", () => {
    const store = createFitnessStore(localStorage)
    store.write("business-a", savedState)

    expect(store.read("business-b")).toEqual({
      handlers: [],
      application: null,
    })
    expect(localStorage.getItem(fitnessStorageKey("business-b"))).toBeNull()
  })

  it("notifies only the matching profile and removes listeners on cleanup", () => {
    const store = createFitnessStore(localStorage)
    const businessA = vi.fn()
    const businessB = vi.fn()
    const unsubscribeA = store.subscribe("business-a", businessA)
    const unsubscribeB = store.subscribe("business-b", businessB)

    store.write("business-a", savedState)

    expect(businessA).toHaveBeenCalledWith(savedState)
    expect(businessB).not.toHaveBeenCalled()

    unsubscribeA()
    unsubscribeB()
    store.write("business-a", { handlers: [], application: null })

    expect(businessA).toHaveBeenCalledTimes(1)
  })
})
