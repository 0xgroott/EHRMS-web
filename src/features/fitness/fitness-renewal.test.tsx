import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FitnessProvider, useFitness } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

beforeEach(() => localStorage.clear())

function RenewalProbe() {
  const { state, startRenewal, selectHandlers } = useFitness()
  return (
    <>
      <span data-testid="active">{state.application?.id ?? "none"}</span>
      <span data-testid="history">
        {state.history?.map((item) => item.id).join(",")}
      </span>
      <button onClick={startRenewal}>Renew</button>
      <button onClick={() => selectHandlers(["handler-ada"])}>
        Select handler
      </button>
    </>
  )
}

it("archives the issued application and retains its certificate while starting a distinct renewal", async () => {
  createFitnessStore().write("BUS-001", {
    handlers: [
      {
        id: "handler-ada",
        fullName: "Ada Okafor",
        sex: "Female",
        dateOfBirth: "1991-04-12",
        role: "Cook",
        identityNumber: "NIN-1",
        phone: "08030000000",
        premisesName: "Riverside Kitchen",
        consent: true,
      },
    ],
    application: {
      id: "fitness-application-1",
      handlerIds: ["handler-ada"],
      stage: "issued",
      paymentReference: "FIT-PAY-1",
      certificate: {
        id: "FIT-CERT-1",
        handlerIds: ["handler-ada"],
        councilId: "phc",
        issuedAt: "2026-01-01",
        expiresAt: "2027-01-01",
      },
    },
  })
  const user = userEvent.setup()
  render(
    <FitnessProvider>
      <RenewalProbe />
    </FitnessProvider>
  )
  expect(await screen.findByTestId("active")).toHaveTextContent(
    "fitness-application-1"
  )

  await user.click(screen.getByRole("button", { name: "Renew" }))
  expect(screen.getByTestId("active")).toHaveTextContent("none")
  expect(screen.getByTestId("history")).toHaveTextContent(
    "fitness-application-1"
  )
  const archived = createFitnessStore().read("BUS-001").history?.[0]
  expect(archived?.certificate?.id).toBe("FIT-CERT-1")
  expect(archived?.paymentReference).toBe("FIT-PAY-1")
  expect(archived?.handlerSnapshots?.[0].fullName).toBe("Ada Okafor")

  await user.click(screen.getByRole("button", { name: "Select handler" }))
  expect(screen.getByTestId("active")).toHaveTextContent(
    "fitness-application-2"
  )
  expect(
    createFitnessStore().read("BUS-001").history?.[0].certificate?.id
  ).toBe("FIT-CERT-1")
})
