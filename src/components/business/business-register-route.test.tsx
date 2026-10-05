import type * as RouterModule from "@tanstack/react-router"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { ONBOARDING_BUSINESS_CREDENTIALS } from "@/data/business-seeds"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessRegister } from "./business-register-page"

const navigate = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useNavigate: () => navigate,
}))
describe("BusinessRegister fresh identity route", () => {
  beforeEach(() => {
    localStorage.clear()
    navigate.mockClear()
    createBusinessRepository(createBusinessStorage(localStorage)).signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("collects business identity and enters the portal with KYB pending", async () => {
    render(
      <Providers>
        <BusinessRegister />
      </Providers>
    )

    expect(
      await screen.findByRole("heading", { name: "Tell us who is registering" })
    ).toBeVisible()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText("Business name"), "Harbour Foods")
    await user.type(screen.getByLabelText("Your full name"), "Amaka Nwosu")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledExactlyOnceWith({
        to: "/business/dashboard",
      })
    )
    expect(createBusinessStorage(localStorage).read()).toMatchObject({
      stage: "setup",
      profile: {
        businessName: "Harbour Foods",
        contactName: "Amaka Nwosu",
        verified: true,
      },
    })
  })
})
