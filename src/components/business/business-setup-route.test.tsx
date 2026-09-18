import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessSetup } from "@/routes/business.setup"
import { returningBusinessState } from "@/data/business-seeds"

const account = {
  businessName: "Riverside Kitchen",
  contactName: "Ada Okafor",
  phone: "08031234567",
  email: "ada@riverside.ng",
  password: "not-stored-password",
  acceptedTerms: true,
}

const validPremises = {
  premisesName: "Riverside Kitchen",
  businessType: "Restaurant",
  registrationNumber: "RC-12345",
  address: "12 Abonnema Wharf Road",
  ward: "Diobu",
  councilId: "phc",
}

function seedVerifiedSetup(withDraft = false) {
  const repository = createBusinessRepository(
    createBusinessStorage(localStorage)
  )
  repository.createAccount(account)
  repository.verifyContact("123456")
  if (withDraft) repository.savePremisesDraft(validPremises)
}

describe("BusinessSetup route", () => {
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    assign = vi.fn()
    vi.stubGlobal("location", { assign })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("recovers a completed state with missing premises without redirecting back to dashboard", async () => {
    const state = structuredClone(returningBusinessState)
    if (state.profile) delete state.profile.premises
    createBusinessStorage(localStorage).write(state)
    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )
    expect(await screen.findByLabelText("Premises address")).toHaveValue("")
    expect(assign).not.toHaveBeenCalled()
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
    seedVerifiedSetup()

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
    expect(screen.getByText(account.email)).toBeVisible()
    expect(screen.getByText(account.phone)).toBeVisible()
    expect(assign).not.toHaveBeenCalled()
  })

  it("redirects an unverified registration to contact verification", async () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(account)

    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    await waitFor(() => expect(assign).toHaveBeenCalledWith("/business/verify"))
  })

  it("reloads a persisted premises draft with its document metadata", async () => {
    seedVerifiedSetup(true)
    const first = render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )
    await screen.findByLabelText("Premises address")
    first.unmount()

    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    expect(await screen.findByLabelText("Premises address")).toHaveValue(
      validPremises.address
    )
    expect(screen.getByLabelText("Premises name")).toHaveValue(
      validPremises.premisesName
    )
  })

  it("saves a draft and exits to sign in", async () => {
    seedVerifiedSetup()
    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: "Save draft and exit" }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("/business/sign-in")
    )
  })

  it("completes setup and navigates to dashboard exactly once", async () => {
    seedVerifiedSetup(true)
    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: "Save and continue" }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("/business/dashboard")
    )
    expect(assign).toHaveBeenCalledTimes(1)
  })

  it("recovers from a failed completion write and allows one successful retry", async () => {
    seedVerifiedSetup(true)
    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )
    const user = userEvent.setup()
    const complete = await screen.findByRole("button", {
      name: "Save and continue",
    })
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementationOnce(() => {
        throw new Error("storage unavailable")
      })

    await user.click(complete)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to complete setup"
    )
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(assign).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Save and continue" }))
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("/business/dashboard")
    )
    expect(assign).toHaveBeenCalledTimes(1)
  })
})
