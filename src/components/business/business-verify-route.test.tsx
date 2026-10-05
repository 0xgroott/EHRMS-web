import type * as RouterModule from "@tanstack/react-router"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessVerify } from "./business-verify-page"

const validAccount = {
  businessName: "Riverside Kitchen",
  contactName: "Ada Okafor",
  phone: "08098765432",
  email: "ada@example.test",
  password: "not-stored-password",
  acceptedTerms: true,
}

const navigate = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useNavigate: () => navigate,
}))
describe("BusinessVerify route", () => {
  beforeEach(() => {
    localStorage.clear()
    createBusinessRepository(createBusinessStorage(localStorage)).createAccount(
      validAccount
    )
    navigate.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("navigates to setup exactly once after the stateful session reaches setup", async () => {
    render(
      <Providers>
        <BusinessVerify />
      </Providers>
    )

    const input = await screen.findByLabelText("6-digit verification code")
    fireEvent.change(input, { target: { value: "123456" } })
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Verify and continue" }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({ to: "/business/dashboard" })
    })
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalledWith({
      to: "/business/register",
      replace: true,
    })
  })

  it("edits the populated email without exposing phone during onboarding", async () => {
    const value = "updated@example.test"
    const repository = createBusinessRepository(createBusinessStorage())
    repository.verifyContact("123456")
    repository.savePremisesDraft(
      {
        premisesName: "Saved kitchen",
        businessType: "Restaurant",
        address: "Draft address",
        ward: "Diobu",
        councilId: "phc",
      },
      [
        {
          id: "DOC-SAVED",
          name: "saved.pdf",
          size: 123,
          category: "registration",
        },
      ]
    )
    repository.updateContact({
      email: validAccount.email,
      phone: validAccount.phone,
    })
    const before = repository.getState().profile!
    render(
      <Providers>
        <BusinessVerify />
      </Providers>
    )
    fireEvent.click(await screen.findByRole("button", { name: "Change email" }))
    expect(await screen.findByLabelText("Email address")).toHaveValue(
      before.email
    )
    expect(screen.queryByLabelText("Phone number")).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value },
    })
    fireEvent.click(
      screen.getByRole("button", { name: "Save email and continue" })
    )
    expect(
      await screen.findByLabelText("6-digit verification code")
    ).toBeVisible()
    expect(repository.getState().profile).toEqual({
      ...before,
      email: value,
    })
    expect(screen.getByText(/u\*\*\*@example.test/)).toBeVisible()
    expect(navigate).not.toHaveBeenCalled()
  })

  it("recovers an expired persisted code through resend and verification", async () => {
    const storage = createBusinessStorage()
    storage.write({ ...storage.read(), verificationExpiresAt: 0 })
    render(
      <Providers>
        <BusinessVerify />
      </Providers>
    )
    expect(
      await screen.findByText("This code has expired. Request a new code.")
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Verify and continue" })
    ).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Resend code" }))
    await waitFor(() =>
      expect(
        screen.queryByText("This code has expired. Request a new code.")
      ).not.toBeInTheDocument()
    )
    expect(storage.read().verificationExpiresAt).toBeGreaterThan(Date.now())
    fireEvent.change(screen.getByLabelText("6-digit verification code"), {
      target: { value: "123456" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Verify and continue" }))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: "/business/dashboard" })
    )
    expect(storage.read().stage).toBe("setup")
  })

  it.each([["Email address", "ada@riverside.ng", "new@example.test"]])(
    "retains contact data and recovers from duplicate %s",
    async (label, duplicate, replacement) => {
      const repository = createBusinessRepository(createBusinessStorage())
      const before = repository.getState()
      render(
        <Providers>
          <BusinessVerify />
        </Providers>
      )
      fireEvent.click(
        await screen.findByRole("button", { name: "Change email" })
      )
      const input = await screen.findByLabelText(label)
      fireEvent.change(input, { target: { value: duplicate } })
      fireEvent.click(
        screen.getByRole("button", { name: "Save email and continue" })
      )
      await waitFor(() =>
        expect(input).toHaveAccessibleDescription(/already registered/)
      )
      expect(repository.getState()).toEqual(before)
      fireEvent.change(input, { target: { value: replacement } })
      fireEvent.click(
        screen.getByRole("button", { name: "Save email and continue" })
      )
      expect(
        await screen.findByLabelText("6-digit verification code")
      ).toBeVisible()
    }
  )

  it("retains edits after invalid values and a storage failure, then retries", async () => {
    render(
      <Providers>
        <BusinessVerify />
      </Providers>
    )
    fireEvent.click(await screen.findByRole("button", { name: "Change email" }))
    const input = await screen.findByLabelText("Email address")
    fireEvent.change(input, { target: { value: "invalid" } })
    fireEvent.click(
      screen.getByRole("button", { name: "Save email and continue" })
    )
    await waitFor(() =>
      expect(input).toHaveAccessibleDescription(/valid email/)
    )
    fireEvent.change(input, { target: { value: "fixed@example.test" } })
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("full")
    })
    fireEvent.click(
      screen.getByRole("button", { name: "Save email and continue" })
    )
    expect(await screen.findByRole("alert")).toHaveTextContent(/Unable to save/)
    expect(input).toHaveValue("fixed@example.test")
    fireEvent.click(
      screen.getByRole("button", { name: "Save email and continue" })
    )
    expect(
      await screen.findByLabelText("6-digit verification code")
    ).toBeVisible()
  })
})
