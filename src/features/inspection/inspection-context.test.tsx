import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { InspectionProvider, useInspection } from "./inspection-context"

const { mockedStore, mockedSession } = vi.hoisted(() => ({
  mockedStore: {
    read: vi.fn(() => ({ inspection: null })),
    write: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
  },
  mockedSession: {
    state: {
      profile: {
        id: "business-a",
        premises: { councilId: "phc", premisesName: "Riverside Kitchen" },
      },
    },
    isHydrated: true,
  },
}))

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => mockedSession,
}))
vi.mock("./inspection-store", () => ({
  createInspectionStore: () => mockedStore,
  emptyInspectionState: () => ({ inspection: null }),
}))

afterEach(() => {
  mockedStore.read.mockClear()
  mockedStore.write.mockClear()
  mockedStore.subscribe.mockClear()
})

it("guards scheduling and saves an eligible notice to the active profile", () => {
  const { result } = renderHook(() => useInspection(), {
    wrapper: InspectionProvider,
  })
  expect(result.current.isHydrated).toBe(true)
  act(() => expect(result.current.scheduleNotice(false).ok).toBe(false))
  expect(mockedStore.write).not.toHaveBeenCalled()
  act(() => expect(result.current.scheduleNotice(true).ok).toBe(true))
  expect(result.current.state.inspection?.stage).toBe("notice-served")
  expect(mockedStore.write).toHaveBeenCalledWith(
    "business-a",
    expect.objectContaining({
      inspection: expect.objectContaining({
        premisesName: "Riverside Kitchen",
      }),
    })
  )
})
