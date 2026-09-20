import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  EditFoodHandlerDrawerPage,
  NewFoodHandlerDrawerPage,
} from "./food-handler-drawer-pages"

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  addHandler: vi.fn(),
  updateHandler: vi.fn(),
  handlers: [] as Array<{
    id: string
    fullName: string
    sex: string
    dateOfBirth: string
    role: string
    identityNumber: string
    phone: string
    premisesName: string
    consent: boolean
  }>,
}))

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
}))

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: {
      profile: {
        premises: { premisesName: "Riverside Kitchen", ward: "Diobu" },
      },
    },
  }),
}))

vi.mock("@/features/fitness/fitness-context", () => ({
  useFitness: () => ({
    state: { handlers: mocks.handlers, application: null },
    isHydrated: true,
    addHandler: mocks.addHandler,
    updateHandler: mocks.updateHandler,
  }),
}))

vi.mock("@/components/business/business-form-drawer", () => ({
  BusinessFormDrawer: ({
    title,
    onClose,
    children,
  }: {
    title: string
    onClose: () => void
    children: React.ReactNode
  }) => (
    <div role="dialog" aria-label={title}>
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  ),
}))

const existingHandler = {
  id: "handler-ada",
  fullName: "Ada Okafor",
  sex: "Female",
  dateOfBirth: "1991-04-12",
  role: "Kitchen assistant",
  identityNumber: "NIN-12345678901",
  phone: "08030000000",
  premisesName: "Riverside Kitchen",
  consent: true,
}

describe("food handler drawer routes", () => {
  beforeEach(() => {
    mocks.handlers = []
    mocks.navigate.mockClear()
    mocks.addHandler.mockClear()
    mocks.updateHandler.mockClear()
    mocks.updateHandler.mockReturnValue({ ok: true, value: existingHandler })
  })

  it("shows the list behind the add drawer and validates before saving", async () => {
    const user = userEvent.setup()
    render(<NewFoodHandlerDrawerPage />)

    expect(screen.getByRole("heading", { name: "Food handlers" })).toBeVisible()
    expect(
      screen.getByRole("dialog", { name: "Add food handler" })
    ).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Save food handler" }))
    expect(screen.getByText("Enter the handler's full name.")).toBeVisible()
    expect(mocks.addHandler).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText("Full name"), "Chidi Nwosu")
    await user.click(screen.getByRole("button", { name: "Save food handler" }))
    expect(mocks.addHandler).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Chidi Nwosu" })
    )
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/business/food-handlers",
    })
  })

  it("shows the current branch in a disabled location dropdown", () => {
    render(<NewFoodHandlerDrawerPage />)
    expect(
      screen.getByRole("combobox", { name: "Business branch/location" })
    ).toBeDisabled()
    expect(screen.getByText("Riverside Kitchen, Diobu")).toBeVisible()
    expect(screen.queryByText("Food handler details")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Save and add another" })
    ).not.toBeInTheDocument()
  })

  it("shows the list behind the edit drawer and closes to the list", async () => {
    mocks.handlers = [existingHandler]
    const user = userEvent.setup()
    render(<EditFoodHandlerDrawerPage handlerId="handler-ada" />)

    expect(screen.getByRole("heading", { name: "Food handlers" })).toBeVisible()
    expect(
      screen.getByRole("dialog", { name: "Edit food handler" })
    ).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/business/food-handlers",
    })
  })

  it("saves edits to the selected handler and returns to the list", async () => {
    mocks.handlers = [existingHandler]
    const user = userEvent.setup()
    render(<EditFoodHandlerDrawerPage handlerId="handler-ada" />)

    const role = screen.getByLabelText("Job role")
    await user.clear(role)
    await user.type(role, "Head cook")
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(mocks.updateHandler).toHaveBeenCalledWith(
      "handler-ada",
      expect.objectContaining({ role: "Head cook" })
    )
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/business/food-handlers",
    })
  })

  it("keeps the edit drawer open when saving fails", async () => {
    mocks.handlers = [existingHandler]
    mocks.updateHandler.mockReturnValue({
      ok: false,
      error: "Unable to save handler",
    })
    const user = userEvent.setup()
    render(<EditFoodHandlerDrawerPage handlerId="handler-ada" />)

    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to save handler"
    )
    expect(mocks.navigate).not.toHaveBeenCalled()
  })
})
