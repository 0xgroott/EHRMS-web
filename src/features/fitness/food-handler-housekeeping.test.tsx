import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FitnessProvider } from "./fitness-context"
import { createFitnessStore } from "./fitness-store"
import { FoodHandlersPage } from "./food-handlers-page"
import type { FitnessState } from "./fitness-types"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

const handlers: FitnessState["handlers"] = [
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
  {
    id: "handler-bisi",
    fullName: "Bisi Bello",
    sex: "Female",
    dateOfBirth: "1995-05-10",
    role: "Kitchen assistant",
    identityNumber: "",
    phone: "08031111111",
    premisesName: "Riverside Kitchen",
    consent: true,
  },
]

beforeEach(() => localStorage.clear())

function renderWithState(application: FitnessState["application"] = null) {
  createFitnessStore().write("BUS-001", { handlers, application })
  render(
    <FitnessProvider>
      <FoodHandlersPage />
    </FitnessProvider>
  )
}

it("searches and filters staff, archives a record, and restores it from history", async () => {
  renderWithState()
  const user = userEvent.setup()
  await screen.findByText("Ada Okafor")

  await user.type(
    screen.getByRole("searchbox", { name: "Search staff" }),
    "bisi"
  )
  expect(screen.getByText("Bisi Bello")).toBeVisible()
  expect(screen.queryByText("Ada Okafor")).not.toBeInTheDocument()
  await user.clear(screen.getByRole("searchbox", { name: "Search staff" }))
  expect(screen.getByText("Ada Okafor")).toBeVisible()
  expect(screen.getByText("Bisi Bello")).toBeVisible()

  await user.click(screen.getByRole("button", { name: "Archive Ada Okafor" }))
  expect(screen.queryByText("Ada Okafor")).not.toBeInTheDocument()
  expect(
    createFitnessStore().read("BUS-001").handlers[0].archivedAt
  ).toBeTruthy()
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Show" }),
    "archived"
  )
  expect(screen.getByText("Ada Okafor")).toBeVisible()
  await user.click(screen.getByRole("button", { name: "Restore Ada Okafor" }))
  expect(screen.queryByText("Ada Okafor")).not.toBeInTheDocument()
  expect(
    createFitnessStore().read("BUS-001").handlers[0].archivedAt
  ).toBeUndefined()
})

it("keeps a selected staff member in an active application", async () => {
  renderWithState({
    id: "fitness-application-1",
    handlerIds: ["handler-ada"],
    stage: "awaiting-facility",
  })
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole("button", { name: "Archive Ada Okafor" })
  )
  expect(screen.getByRole("alert")).toHaveTextContent(
    "This person is in an active Fitness application"
  )
  expect(
    createFitnessStore().read("BUS-001").handlers[0].archivedAt
  ).toBeUndefined()
})
