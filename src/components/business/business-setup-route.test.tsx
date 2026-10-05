import { waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { render } from "@/test/render-with-router"
import { BusinessSetup } from "./business-setup-page"

describe("legacy BusinessSetup route", () => {
  it("redirects the old onboarding URL to the KYB section in settings", async () => {
    const { router } = render(<BusinessSetup />)
    await waitFor(() =>
      expect(router.state.location.href).toBe("/business/settings#kyb")
    )
    expect(router.history.length).toBe(1)
  })
})
