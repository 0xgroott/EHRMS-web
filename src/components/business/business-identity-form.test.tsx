import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BusinessIdentityForm } from "./business-identity-form"

describe("BusinessIdentityForm", () => {
  it("requires the business name and responsible person's full name", async () => {
    const onSubmit = vi.fn()
    render(<BusinessIdentityForm onSubmit={onSubmit} />)

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Continue" }))

    expect(screen.getByLabelText("Business name")).toHaveAccessibleDescription(
      "Enter the registered business name"
    )
    expect(screen.getByLabelText("Your full name")).toHaveAccessibleDescription(
      "Enter your full name"
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits both identity fields and prevents duplicate continuation", async () => {
    let resolve!: () => void
    const pending = new Promise<void>((complete) => {
      resolve = complete
    })
    const onSubmit = vi.fn().mockReturnValue(pending)
    render(<BusinessIdentityForm onSubmit={onSubmit} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Business name"), "Harbour Foods")
    await user.type(screen.getByLabelText("Your full name"), "Amaka Nwosu")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        businessName: "Harbour Foods",
        contactName: "Amaka Nwosu",
      })
    )
    expect(
      screen.getByRole("button", { name: "Saving details…" })
    ).toBeDisabled()
    resolve()
    await pending
  })

  it("retains names when saving fails", async () => {
    render(
      <BusinessIdentityForm
        onSubmit={vi
          .fn()
          .mockResolvedValue({ error: "Unable to save details" })}
      />
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText("Business name"), "Harbour Foods")
    await user.type(screen.getByLabelText("Your full name"), "Amaka Nwosu")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save details"
    )
    expect(screen.getByLabelText("Business name")).toHaveValue("Harbour Foods")
    expect(screen.getByLabelText("Your full name")).toHaveValue("Amaka Nwosu")
  })
})
