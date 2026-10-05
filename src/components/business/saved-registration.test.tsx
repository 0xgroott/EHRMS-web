import type * as RouterModule from "@tanstack/react-router"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"
import { SavedRegistration } from "./saved-registration"

const navigate = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useNavigate: () => navigate,
}))
describe("saved registration entry", () => {
  beforeEach(() => {
    localStorage.clear()
    navigate.mockClear()
  })
  afterEach(() => vi.unstubAllGlobals())

  it.each(["verification", "setup"])(
    "resumes the saved %s state without replacing the account",
    async (stage) => {
      const repository = createBusinessRepository(createBusinessStorage())
      repository.createAccount({
        businessName: "Saved Cafe",
        contactName: "Nora",
        email: "nora@example.test",
        phone: "08098765432",
        password: "not-persisted-password",
        acceptedTerms: true,
      })
      if (stage === "setup") {
        repository.verifyContact("123456")
        repository.savePremisesDraft({
          premisesName: "Saved premises",
          businessType: "",
          address: "Draft address",
          ward: "",
          councilId: "",
        })
      }
      const before = repository.getState()
      const markup = renderToString(
        <Providers>
          <SavedRegistration />
        </Providers>
      )
      expect(markup).not.toContain("Continue saved registration")
      render(
        <Providers>
          <SavedRegistration />
        </Providers>
      )
      fireEvent.click(
        await screen.findByRole("button", {
          name: "Continue saved registration",
        })
      )
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({
          to: stage === "setup" ? "/business/dashboard" : "/business/verify",
        })
      )
      expect(repository.getState()).toEqual(before)
      expect(screen.getByText(/saved in this browser/i)).toBeVisible()
    }
  )

  it("hides resume when there is no saved registration", async () => {
    render(
      <Providers>
        <SavedRegistration />
      </Providers>
    )
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Continue saved registration" })
      ).not.toBeInTheDocument()
    )
  })
})
