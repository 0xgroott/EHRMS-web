import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  EditFoodHandlerDrawerPage,
  NewFoodHandlerDrawerPage,
} from "./food-handler-drawer-pages"

vi.mock("@/components/ui/select", async () => import("./select-test-double"))

Object.defineProperty(window, "PointerEvent", {
  configurable: true,
  value: MouseEvent,
})

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

    const dialog = screen.getByRole("dialog", { name: "Add staff" })
    expect(dialog).toBeVisible()
    expect(dialog).toHaveClass(
      "sm:max-w-[456px]!",
      "max-h-[600px]",
      "overflow-hidden",
      "rounded-xl"
    )
    expect(dialog.querySelector(".staff-dialog-scroll")).toBeInTheDocument()
    const save = screen.getByRole("button", { name: "Save staff member" })
    expect(save).toBeDisabled()
    expect(mocks.addHandler).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Chidi Nwosu" },
    })
    fireEvent.change(screen.getByRole("combobox", { name: "Sex" }), {
      target: { value: "Male" },
    })
    fireEvent.change(screen.getByLabelText("Date of birth"), {
      target: { value: "1990-06-15" },
    })
    fireEvent.change(screen.getByLabelText("Job role"), {
      target: { value: "Cook" },
    })
    fireEvent.change(screen.getByLabelText("Identity number"), {
      target: { value: "NIN-456" },
    })
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "08030000000" },
    })
    expect(save).toBeDisabled()
    await user.click(
      screen.getByRole("checkbox", { name: /Fitness Certificate process/i })
    )
    expect(save).toBeEnabled()
    await user.click(save)
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

    expect(screen.getByRole("heading", { name: "Staff" })).toBeVisible()
    expect(
      screen.getByRole("dialog", { name: "Edit staff member" })
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

    fireEvent.change(screen.getByLabelText("Job role"), {
      target: { value: "Head cook" },
    })
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

    expect(
      screen.getByText("Unable to save handler").closest('[role="alert"]')
    ).toBeInTheDocument()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })
})
