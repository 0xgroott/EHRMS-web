import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FoodHandlerForm } from "./food-handler-form"

Object.defineProperty(window, "PointerEvent", {
  configurable: true,
  value: MouseEvent,
})

const handler = {
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
const singleBranch = [
  { value: "Riverside Kitchen", label: "Riverside Kitchen, Diobu" },
]

describe("FoodHandlerForm", () => {
  it("keeps entered values and shows an inline error when a name is missing", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        branchOptions={singleBranch}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText("Job role"), "Kitchen assistant")
    await user.type(screen.getByLabelText("Identity number"), "NIN-123")
    await user.type(screen.getByLabelText("Phone number"), "08030000000")
    await user.click(screen.getByRole("button", { name: "Save food handler" }))

    expect(screen.getByText("Enter the handler's full name.")).toBeVisible()
    expect(screen.getByLabelText("Job role")).toHaveValue("Kitchen assistant")
    expect(onSave).not.toHaveBeenCalled()
  })

  it("saves a named handler with incomplete Fitness details for follow-up", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        branchOptions={singleBranch}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText("Full name"), "Chidi Nwosu")
    await user.click(screen.getByRole("button", { name: "Save food handler" }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Chidi Nwosu",
        identityNumber: "",
        role: "",
        phone: "",
        consent: false,
      })
    )
  })

  it("shows the only business branch as a disabled dropdown and saves it", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        branchOptions={singleBranch}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    await user.type(screen.getByLabelText("Full name"), "Ada Okafor")
    await user.type(screen.getByLabelText("Job role"), "Kitchen assistant")
    await user.type(screen.getByLabelText("Identity number"), "NIN-123")
    await user.type(screen.getByLabelText("Phone number"), "08030000000")
    screen
      .getByRole("checkbox", { name: /Fitness Certificate process/i })
      .focus()
    await user.keyboard("[Space]")
    expect(
      screen.getByRole("combobox", { name: "Business branch/location" })
    ).toBeDisabled()
    expect(screen.getByText("Riverside Kitchen, Diobu")).toBeVisible()
    expect(
      screen.queryByRole("button", { name: "Save and add another" })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Save food handler" }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Okafor",
        role: "Kitchen assistant",
        premisesName: "Riverside Kitchen",
        consent: true,
      })
    )
  })

  it("enables branch selection when multiple locations are available", () => {
    render(
      <FoodHandlerForm
        branchOptions={[
          ...singleBranch,
          {
            value: "Riverside Kitchen, Rumuodara",
            label: "Riverside Kitchen, Rumuodara",
          },
        ]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    const branch = screen.getByRole("combobox", {
      name: "Business branch/location",
    })
    expect(branch).toBeEnabled()
    expect(branch).toHaveTextContent("Riverside Kitchen, Diobu")
  })

  it("prefills an existing handler and submits edits", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        handler={handler}
        branchOptions={singleBranch}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    const role = screen.getByLabelText("Job role")
    await user.clear(role)
    await user.type(role, "Head cook")
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "handler-ada", role: "Head cook" })
    )
  })
})
