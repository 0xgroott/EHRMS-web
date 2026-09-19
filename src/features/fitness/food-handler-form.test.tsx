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

describe("FoodHandlerForm", () => {
  it("keeps entered values and shows an inline error when a name is missing", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        premisesName="Riverside Kitchen"
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
        premisesName="Riverside Kitchen"
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
      }),
      "list"
    )
  })

  it("saves a complete handler and supports saving another record", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        premisesName="Riverside Kitchen"
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
    await user.click(
      screen.getByRole("button", { name: "Save and add another" })
    )

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ada Okafor",
        role: "Kitchen assistant",
        premisesName: "Riverside Kitchen",
        consent: true,
      }),
      "another"
    )
  })

  it("prefills an existing handler and submits edits", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        handler={handler}
        premisesName="Riverside Kitchen"
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    const role = screen.getByLabelText("Job role")
    await user.clear(role)
    await user.type(role, "Head cook")
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "handler-ada", role: "Head cook" }),
      "list"
    )
  })
})
