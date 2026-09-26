import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, expect, it, vi } from "vitest"
import { FitnessProvider, useFitness } from "./fitness-context"
import type { FitnessState } from "./fitness-types"

const { mockedStore, mockedSession } = vi.hoisted(() => {
  const unsubscribe = vi.fn()
  return {
    mockedStore: {
      listener: null as ((state: FitnessState) => void) | null,
      read: vi.fn<() => FitnessState>(() => ({
        handlers: [],
        application: null,
      })),
      write: vi.fn(),
      subscribe: vi.fn(
        (_profileId: string, listener: (state: FitnessState) => void) => {
          mockedStore.listener = listener
          return unsubscribe
        }
      ),
      unsubscribe,
    },
    mockedSession: {
      state: {
        profile: {
          id: "business-a",
          premises: { councilId: "phc" },
        },
      },
      isHydrated: true,
    },
  }
})

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => mockedSession,
}))

vi.mock("./fitness-store", () => ({
  createFitnessStore: () => mockedStore,
  emptyFitnessState: () => ({ handlers: [], application: null }),
}))

function Probe() {
  const { state, resetApplications } = useFitness()
  return (
    <>
      <span data-testid="handler-count">{state.handlers.length}</span>
      <span data-testid="application">{state.application?.id ?? "none"}</span>
      <span data-testid="history-count">{state.history?.length ?? 0}</span>
      <button onClick={resetApplications}>Reset applications</button>
    </>
  )
}

afterEach(() => {
  mockedStore.listener = null
  mockedStore.read.mockClear()
  mockedStore.write.mockClear()
  mockedStore.subscribe.mockClear()
  mockedStore.unsubscribe.mockClear()
})

it("subscribes to the active profile and cleans up its listener", () => {
  const view = render(
    <FitnessProvider>
      <Probe />
    </FitnessProvider>
  )

  expect(mockedStore.subscribe).toHaveBeenCalledWith(
    "business-a",
    expect.any(Function)
  )
  act(() => {
    mockedStore.listener?.({
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
    })
  })

  expect(screen.getByTestId("handler-count")).toHaveTextContent("1")
  view.unmount()
  expect(mockedStore.unsubscribe).toHaveBeenCalledTimes(1)
})

it("resets Fitness application progress while preserving kitchen staff", async () => {
  mockedStore.read.mockReturnValueOnce({
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
    application: {
      id: "fitness-application-2",
      handlerIds: ["handler-ada"],
      stage: "draft",
    },
    history: [
      {
        id: "fitness-application-1",
        handlerIds: ["handler-ada"],
        stage: "issued",
      },
    ],
  })
  const user = userEvent.setup()
  render(
    <FitnessProvider>
      <Probe />
    </FitnessProvider>
  )

  expect(await screen.findByTestId("handler-count")).toHaveTextContent("1")
  await user.click(screen.getByRole("button", { name: "Reset applications" }))

  expect(screen.getByTestId("handler-count")).toHaveTextContent("1")
  expect(screen.getByTestId("application")).toHaveTextContent("none")
  expect(screen.getByTestId("history-count")).toHaveTextContent("0")
  expect(mockedStore.write).toHaveBeenLastCalledWith("business-a", {
    handlers: [expect.objectContaining({ id: "handler-ada" })],
    application: null,
  })
})
