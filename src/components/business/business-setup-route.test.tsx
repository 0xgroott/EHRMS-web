import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import { returningBusinessState } from "@/data/business-seeds"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessSetup } from "./business-setup-page"

describe("legacy BusinessSetup route", () => {
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    createBusinessStorage(localStorage).write(
      structuredClone(returningBusinessState)
    )
    assign = vi.fn()
    vi.stubGlobal("location", { assign })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("redirects the old onboarding URL to the KYB section in settings", async () => {
    render(
      <Providers>
        <BusinessSetup />
      </Providers>
    )

    expect(screen.getByRole("status")).toHaveTextContent(
      "Opening business verification"
    )
    await waitFor(() =>
      expect(assign).toHaveBeenCalledExactlyOnceWith("/business/settings#kyb")
    )
  })
})
