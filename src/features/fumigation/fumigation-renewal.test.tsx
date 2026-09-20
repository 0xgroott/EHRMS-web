import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FumigationProvider, useFumigation } from "./fumigation-context"
import { createFumigationStore } from "./fumigation-store"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

beforeEach(() => localStorage.clear())

function RenewalProbe() {
  const { state, startRenewal, startApplication } = useFumigation()
  return (
    <>
      <span data-testid="active">{state.application?.id ?? "none"}</span>
      <span data-testid="history">
        {state.history?.map((item) => item.id).join(",")}
      </span>
      <button onClick={startRenewal}>Renew</button>
      <button onClick={() => startApplication("October 2026", true)}>
        Start application
      </button>
    </>
  )
}

it("retains the old Fumigation certificate and starts the next application with a new ID", async () => {
  createFumigationStore().write("BUS-001", {
    application: {
      id: "fumigation-application-1",
      requestedPeriod: "September 2026",
      declaration: true,
      stage: "issued",
      paymentReference: "FUM-PAY-1",
      workDate: "2026-09-01",
      certificate: {
        id: "FUM-CERT-1",
        councilId: "phc",
        issuedAt: "2026-09-02",
        expiresAt: "2027-09-02",
        workDate: "2026-09-01",
      },
    },
  })
  const user = userEvent.setup()
  render(
    <FumigationProvider>
      <RenewalProbe />
    </FumigationProvider>
  )
  expect(await screen.findByTestId("active")).toHaveTextContent(
    "fumigation-application-1"
  )

  await user.click(screen.getByRole("button", { name: "Renew" }))
  expect(screen.getByTestId("active")).toHaveTextContent("none")
  expect(screen.getByTestId("history")).toHaveTextContent(
    "fumigation-application-1"
  )
  expect(
    createFumigationStore().read("BUS-001").history?.[0].certificate?.id
  ).toBe("FUM-CERT-1")

  await user.click(screen.getByRole("button", { name: "Start application" }))
  expect(screen.getByTestId("active")).toHaveTextContent(
    "fumigation-application-2"
  )
  expect(
    createFumigationStore().read("BUS-001").history?.[0].paymentReference
  ).toBe("FUM-PAY-1")
})
