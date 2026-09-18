import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { AccountForm } from "./account-form"
import type { BusinessAccountInput } from "@/domain/business-types"

// jsdom does not provide the PointerEvent constructor used by Base UI.
beforeAll(() => vi.stubGlobal("PointerEvent", MouseEvent))
afterAll(() => vi.unstubAllGlobals())

const account: BusinessAccountInput = {
  businessName: "Riverside Kitchen",
  contactName: "Ada Okafor",
  phone: "08031234567",
  email: "ada@riverside.ng",
  password: "secure-demo-password",
  acceptedTerms: true,
}

async function fillAccount(values = account) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Business name"), values.businessName)
  await user.type(
    screen.getByLabelText("Contact person's name"),
    values.contactName
  )
  await user.type(screen.getByLabelText("Phone number"), values.phone)
  await user.type(screen.getByLabelText("Email address"), values.email)
  await user.type(screen.getByLabelText("Password"), values.password)
  if (values.acceptedTerms) await user.click(screen.getByRole("checkbox"))
  return user
}

function renderAccount(onSubmit = vi.fn()) {
  render(
    <AccountForm
      onSubmit={onSubmit}
      signInLink={<a href="/business/sign-in">Sign in</a>}
    />
  )
  return onSubmit
}

describe("AccountForm", () => {
  it("associates required-field errors with all six controls", async () => {
    const onSubmit = renderAccount()
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Create account" }))
    for (const [label, error] of [
      ["Business name", "Enter the registered business name"],
      ["Contact person's name", "Enter the contact person's name"],
      ["Phone number", "Enter a valid phone number"],
      ["Email address", "Enter a valid email address"],
      ["Password", "Use at least 10 characters"],
    ]) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "true"
      )
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription(
        new RegExp(error)
      )
    }
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription(
      "Accept the terms and privacy notice"
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("retains invalid entries for correction", async () => {
    const onSubmit = renderAccount()
    const user = await fillAccount({
      ...account,
      email: "invalid",
      phone: "123",
      password: "short",
    })
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(screen.getByLabelText("Email address")).toHaveValue("invalid")
    expect(screen.getByLabelText("Phone number")).toHaveValue("123")
    expect(screen.getByLabelText("Password")).toHaveValue("short")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("submits the exact account once after valid input and consent", async () => {
    const onSubmit = renderAccount()
    const user = await fillAccount()
    await user.click(screen.getByRole("button", { name: "Create account" }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(account)
    )
  })

  it("retains entries and exposes a recoverable submission error", async () => {
    renderAccount(
      vi.fn().mockResolvedValue({ error: "Unable to save. Please try again." })
    )
    const user = await fillAccount()
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save. Please try again."
    )
    expect(screen.getByLabelText("Email address")).toHaveValue(account.email)
    expect(screen.getByLabelText("Password")).toHaveValue(account.password)
    expect(screen.getByRole("checkbox")).toBeChecked()
  })

  it("exposes a sign-in link and password guidance", () => {
    renderAccount()
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/business/sign-in"
    )
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Use at least 10 characters."
    )
  })
})
