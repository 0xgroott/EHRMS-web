import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessVerify } from "@/routes/business.verify"

const validAccount = {
  businessName: "Riverside Kitchen",
  contactName: "Ada Okafor",
  phone: "08098765432",
  email: "ada@riverside.ng",
  password: "not-stored-password",
  acceptedTerms: true,
}

describe("BusinessVerify route", () => {
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    createBusinessRepository(createBusinessStorage(localStorage)).createAccount(
      validAccount
    )
    assign = vi.fn()
    vi.stubGlobal("location", { assign })
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
      expect(assign).toHaveBeenCalledWith("/business/setup")
    })
    expect(assign).toHaveBeenCalledTimes(1)
    expect(assign).not.toHaveBeenCalledWith("/business/register")
  })
})
