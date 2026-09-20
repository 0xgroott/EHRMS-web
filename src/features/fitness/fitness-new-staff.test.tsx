import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FitnessProvider, useFitness } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"
import type { FoodHandler } from "./fitness-types"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

const ada: FoodHandler = {
  id: "ada",
  fullName: "Ada Okafor",
  role: "Cook",
  sex: "Female",
  dateOfBirth: "1990-01-01",
  identityNumber: "TEST-ADA",
  phone: "08030000000",
  premisesName: "Riverside Kitchen",
  consent: true,
}
const bola: FoodHandler = { ...ada, id: "bola", fullName: "Bola James" }

beforeEach(() => localStorage.clear())

function NewStaffProbe() {
  const { state, startNewStaffApplication, selectHandlers } = useFitness()
  return (
    <>
      <span data-testid="active-purpose">
        {state.application?.purpose ?? "none"}
      </span>
      <button onClick={() => startNewStaffApplication()}>
        Start new staff
      </button>
      <button onClick={() => selectHandlers(["ada"])}>Select covered</button>
      <button onClick={() => selectHandlers(["bola"])}>Select new staff</button>
    </>
  )
}

it("starts a separate new-staff draft and preserves the issued certificate", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [ada, bola],
    application: {
      id: "fitness-application-1",
      handlerIds: ["ada"],
      stage: "issued",
      certificate: {
        id: "FIT-CERT-1",
        handlerIds: ["ada"],
        councilId: "phc",
        issuedAt: "2026-01-01",
        expiresAt: "2027-01-01",
      },
    },
  })
  const user = userEvent.setup()
  render(
    <FitnessProvider>
      <NewStaffProbe />
    </FitnessProvider>
  )

  await user.click(screen.getByRole("button", { name: "Start new staff" }))
  const afterStart = createFitnessStore().read("BUS-001")
  expect(afterStart.application).toMatchObject({
    id: "fitness-application-2",
    handlerIds: [],
    purpose: "new-staff",
    stage: "draft",
  })
  expect(afterStart.history?.[0].certificate?.id).toBe("FIT-CERT-1")
  expect(afterStart.history?.[0].handlerSnapshots?.[0].fullName).toBe(
    "Ada Okafor"
  )

  await user.click(screen.getByRole("button", { name: "Select covered" }))
  expect(createFitnessStore().read("BUS-001").application?.handlerIds).toEqual(
    []
  )
  await user.click(screen.getByRole("button", { name: "Select new staff" }))
  expect(createFitnessStore().read("BUS-001").application).toMatchObject({
    handlerIds: ["bola"],
    purpose: "new-staff",
  })
})

it("keeps the issued application when no new eligible staff are available", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [ada],
    application: {
      id: "fitness-application-1",
      handlerIds: ["ada"],
      stage: "issued",
      certificate: {
        id: "FIT-CERT-1",
        handlerIds: ["ada"],
        councilId: "phc",
        issuedAt: "2026-01-01",
        expiresAt: "2027-01-01",
      },
    },
  })
  const user = userEvent.setup()
  render(
    <FitnessProvider>
      <NewStaffProbe />
    </FitnessProvider>
  )

  await user.click(screen.getByRole("button", { name: "Start new staff" }))
  expect(createFitnessStore().read("BUS-001").application?.stage).toBe("issued")
  expect(createFitnessStore().read("BUS-001").history).toBeUndefined()
})
