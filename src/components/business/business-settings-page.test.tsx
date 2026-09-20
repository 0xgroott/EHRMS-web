import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { Providers } from "@/app/providers"
import { returningBusinessState } from "@/data/business-seeds"
import { createBusinessStorage } from "@/services/business-storage"
import { readBusinessSettings } from "@/services/business-settings"
import { BusinessMediaProvider } from "@/features/business-media/business-media-context"
import { BusinessSettingsPage } from "./business-settings-page"

beforeEach(() => {
  localStorage.clear()
  createBusinessStorage(localStorage).write(
    structuredClone(returningBusinessState)
  )
})

describe("business settings page", () => {
  it("shows verified account details and persists notification choices", async () => {
    render(
      <Providers>
        <BusinessMediaProvider>
          <BusinessSettingsPage />
        </BusinessMediaProvider>
      </Providers>
    )
    expect(
      await screen.findByRole("heading", { name: "Business settings" })
    ).toBeVisible()
    expect(
      screen.getByRole("tab", { name: "Business profile" })
    ).toHaveAttribute("aria-selected", "true")
    const user = userEvent.setup()
    await user.click(screen.getByRole("tab", { name: "Account" }))
    expect(screen.getByDisplayValue("ada@riverside.ng")).toBeVisible()
    expect(screen.getByRole("textbox", { name: "Phone number" })).toHaveValue(
      "08031234567"
    )
    expect(screen.getByRole("textbox", { name: "Council" })).toHaveValue(
      "Port Harcourt City"
    )
    expect(
      screen.getByRole("textbox", { name: "Email address" })
    ).toHaveAttribute("readonly")
    await user.click(screen.getByRole("tab", { name: "Notifications" }))
    await user.click(
      screen.getByRole("checkbox", { name: /Application updates/ })
    )
    await user.click(screen.getByRole("button", { name: "Save preferences" }))
    await waitFor(() =>
      expect(readBusinessSettings("BUS-001", localStorage)).toEqual({
        applicationEmails: true,
        inspectionEmails: false,
      })
    )
    expect(
      await screen.findByText("Notification preferences saved")
    ).toBeVisible()
  })

  it("edits and saves business profile fields directly on the profile tab", async () => {
    render(
      <Providers>
        <BusinessMediaProvider>
          <BusinessSettingsPage />
        </BusinessMediaProvider>
      </Providers>
    )
    const name = await screen.findByRole("textbox", {
      name: "Registered business name",
    })
    expect(name).toHaveValue("Riverside Kitchen & Foods")
    expect(screen.getByRole("textbox", { name: "Premises name" })).toHaveValue(
      "Riverside Kitchen"
    )
    expect(
      screen.queryByRole("button", { name: "Edit profile" })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.clear(name)
    await user.type(name, "Riverside Market Kitchen")
    await user.click(screen.getByRole("tab", { name: "Account" }))
    await user.click(screen.getByRole("tab", { name: "Business profile" }))
    expect(
      screen.getByRole("textbox", { name: "Registered business name" })
    ).toHaveValue("Riverside Market Kitchen")
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() =>
      expect(
        createBusinessStorage(localStorage).read().profile?.businessName
      ).toBe("Riverside Market Kitchen")
    )
    expect(await screen.findByText("Business profile saved")).toBeVisible()
  })
})
