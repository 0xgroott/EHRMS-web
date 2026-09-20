import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { FoodHandlerForm } from "./food-handler-form"

vi.mock("@/components/ui/select", async () => import("./select-test-double"))

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
  it("keeps entered values while save is disabled for missing requirements", async () => {
    const onSave = vi.fn()
    render(
      <FoodHandlerForm
        branchOptions={singleBranch}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText("Job role"), {
      target: { value: "Kitchen assistant" },
    })
    fireEvent.change(screen.getByLabelText("Identity number"), {
      target: { value: "NIN-123" },
    })
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "08030000000" },
    })
    expect(
      screen.getByRole("button", { name: "Save food handler" })
    ).toBeDisabled()
    expect(screen.getByLabelText("Job role")).toHaveValue("Kitchen assistant")
    expect(onSave).not.toHaveBeenCalled()
  })

  it("enables save only after every field and consent are complete", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(
      <FoodHandlerForm
        branchOptions={singleBranch}
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Chidi Nwosu" },
    })
    const save = screen.getByRole("button", { name: "Save food handler" })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByRole("combobox", { name: "Sex" }), {
      target: { value: "Male" },
    })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText("Date of birth"), {
      target: { value: "1990-06-15" },
    })
    expect(save).toBeDisabled()
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
    expect(onSave).not.toHaveBeenCalled()
    await user.click(
      screen.getByRole("checkbox", { name: /Fitness Certificate process/i })
    )
    expect(save).toBeEnabled()
    await user.click(save)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Chidi Nwosu", consent: true })
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

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Ada Okafor" },
    })
    fireEvent.change(screen.getByRole("combobox", { name: "Sex" }), {
      target: { value: "Female" },
    })
    fireEvent.change(screen.getByLabelText("Date of birth"), {
      target: { value: "1991-04-12" },
    })
    fireEvent.change(screen.getByLabelText("Job role"), {
      target: { value: "Kitchen assistant" },
    })
    fireEvent.change(screen.getByLabelText("Identity number"), {
      target: { value: "NIN-123" },
    })
    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "08030000000" },
    })
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

  it("requires a registered branch before saving", async () => {
    const onSave = vi.fn()
    render(
      <FoodHandlerForm branchOptions={[]} onSave={onSave} onCancel={vi.fn()} />
    )

    expect(
      screen.getByRole("button", { name: "Save food handler" })
    ).toBeDisabled()
    expect(onSave).not.toHaveBeenCalled()
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

    fireEvent.change(screen.getByLabelText("Job role"), {
      target: { value: "Head cook" },
    })
    await user.click(screen.getByRole("button", { name: "Save changes" }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "handler-ada", role: "Head cook" })
    )
  })
})
