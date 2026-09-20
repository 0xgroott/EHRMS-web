import { render, screen } from "@testing-library/react"
import { afterEach, expect, it } from "vitest"
import { AppToastProvider, notifySuccessAfterNavigation } from "./app-toast"

afterEach(() => sessionStorage.clear())

it("shows a completed action after a full-page navigation", async () => {
  notifySuccessAfterNavigation("Business setup completed")

  render(
    <AppToastProvider>
      <p>Destination page</p>
    </AppToastProvider>
  )

  expect(await screen.findByText("Business setup completed")).toBeVisible()
  expect(sessionStorage.length).toBe(0)
})
