import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessSetup } from "@/routes/business.setup"

const account = {
  businessName: "Riverside Kitchen",
  contactName: "Ada Okafor",
  phone: "08031234567",
  email: "ada@riverside.ng",
  password: "not-stored-password",
  acceptedTerms: true,
}

describe("BusinessSetup route", () => {
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    assign = vi.fn()
    vi.stubGlobal("location", { assign })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("waits for hydration and redirects a missing registration to account entry", async () => {
    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your business setup"
    )
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("/business/register")
    )
  })

  it("renders the resumable setup form only after contact verification", async () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(account)
    repository.verifyContact("123456")

    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    expect(
      await screen.findByRole("heading", {
        name: "Tell us about your business",
      })
    ).toBeVisible()
    expect(screen.getByLabelText("Premises name")).toHaveValue(
      "Riverside Kitchen"
    )
    expect(assign).not.toHaveBeenCalled()
  })
})
