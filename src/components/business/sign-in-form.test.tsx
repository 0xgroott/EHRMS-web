import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { SignInForm } from "./sign-in-form"
import { DEMO_BUSINESS_CREDENTIALS } from "@/data/business-seeds"

function renderSignIn(onSubmit = vi.fn()) {
  render(
    <SignInForm
      onSubmit={onSubmit}
      createAccountLink={<a href="/business/register">Create account</a>}
    />
  )
  return onSubmit
}

describe("SignInForm", () => {
  it.each(["ada@riverside.ng", "08031234567"])(
    "submits contact %s and password",
    async (contact) => {
      const onSubmit = renderSignIn()
      const user = userEvent.setup()
      await user.type(screen.getByLabelText("Email or phone number"), contact)
      await user.type(screen.getByLabelText("Password"), "riverside-demo")
      await user.click(screen.getByRole("button", { name: "Sign in" }))
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
          contact,
          password: "riverside-demo",
        })
      )
    }
  )

  it("submits the seeded demo credentials from the shortcut", async () => {
    const onSubmit = renderSignIn()
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Preview as business user" }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        contact: DEMO_BUSINESS_CREDENTIALS.email,
        password: DEMO_BUSINESS_CREDENTIALS.password,
      })
    )
  })

  it("shows invalid credentials without clearing inputs", async () => {
    renderSignIn(
      vi.fn().mockResolvedValue({ error: "Email or password is incorrect" })
    )
    const user = userEvent.setup()
    await user.type(
      screen.getByLabelText("Email or phone number"),
      "ada@riverside.ng"
    )
    await user.type(screen.getByLabelText("Password"), "incorrect")
    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or password is incorrect"
    )
    expect(screen.getByLabelText("Email or phone number")).toHaveValue(
      "ada@riverside.ng"
    )
    expect(screen.getByLabelText("Password")).toHaveValue("incorrect")
  })

  it("requires both fields and exposes Create account", async () => {
    const onSubmit = renderSignIn()
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Sign in" }))
    expect(
      screen.getByLabelText("Email or phone number")
    ).toHaveAccessibleDescription("Enter your email or phone number")
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Enter your password"
    )
    expect(onSubmit).not.toHaveBeenCalled()
    expect(
      screen.getByRole("link", { name: "Create account" })
    ).toHaveAttribute("href", "/business/register")
  })

  it("prevents duplicate sign-in actions while submission is pending", async () => {
    let resolve!: () => void
    const pending = new Promise<void>((complete) => {
      resolve = complete
    })
    const onSubmit = renderSignIn(vi.fn().mockReturnValue(pending))
    const user = userEvent.setup()
    await user.type(
      screen.getByLabelText("Email or phone number"),
      DEMO_BUSINESS_CREDENTIALS.email
    )
    await user.type(
      screen.getByLabelText("Password"),
      DEMO_BUSINESS_CREDENTIALS.password
    )
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    const submit = screen.getByRole("button", { name: "Signing in…" })
    const demo = screen.getByRole("button", {
      name: "Preview as business user",
    })
    expect(submit).toBeDisabled()
    expect(demo).toBeDisabled()
    await user.click(submit)
    await user.click(demo)
    await user.click(screen.getByLabelText("Password"))
    await user.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      contact: DEMO_BUSINESS_CREDENTIALS.email,
      password: DEMO_BUSINESS_CREDENTIALS.password,
    })

    await act(async () => {
      resolve()
      await pending
    })
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled()
    expect(demo).toBeEnabled()
  })

  it("retains credentials after a rejected action and allows retry", async () => {
    const onSubmit = renderSignIn(
      vi
        .fn()
        .mockRejectedValueOnce(new Error("Storage unavailable"))
        .mockResolvedValueOnce(undefined)
    )
    const user = userEvent.setup()
    await user.type(
      screen.getByLabelText("Email or phone number"),
      DEMO_BUSINESS_CREDENTIALS.email
    )
    await user.type(
      screen.getByLabelText("Password"),
      DEMO_BUSINESS_CREDENTIALS.password
    )
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to sign in. Please try again."
    )
    expect(screen.getByLabelText("Email or phone number")).toHaveValue(
      DEMO_BUSINESS_CREDENTIALS.email
    )
    expect(screen.getByLabelText("Password")).toHaveValue(
      DEMO_BUSINESS_CREDENTIALS.password
    )

    await user.click(screen.getByRole("button", { name: "Sign in" }))
    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(onSubmit).toHaveBeenLastCalledWith({
      contact: DEMO_BUSINESS_CREDENTIALS.email,
      password: DEMO_BUSINESS_CREDENTIALS.password,
    })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})
