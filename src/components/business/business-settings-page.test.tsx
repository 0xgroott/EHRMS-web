import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { Providers } from "@/app/providers"
import { returningBusinessState } from "@/data/business-seeds"
import { createBusinessStorage } from "@/services/business-storage"
import { readBusinessSettings } from "@/services/business-settings"
import { BusinessMediaProvider } from "@/features/business-media/business-media-context"
import { FitnessProvider } from "@/features/fitness/fitness-context"
import { createFitnessStore } from "@/features/fitness/fitness-store"
import { FumigationProvider } from "@/features/fumigation/fumigation-context"
import { createFumigationStore } from "@/features/fumigation/fumigation-store"
import { InspectionProvider } from "@/features/inspection/inspection-context"
import { createInspectionStore } from "@/features/inspection/inspection-store"
import { BusinessSettingsPage } from "./business-settings-page"

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, "", "/business/settings")
  createBusinessStorage(localStorage).write(
    structuredClone(returningBusinessState)
  )
})

function renderSettings() {
  return render(
    <Providers>
      <FitnessProvider>
        <FumigationProvider>
          <InspectionProvider>
            <BusinessMediaProvider>
              <BusinessSettingsPage />
            </BusinessMediaProvider>
          </InspectionProvider>
        </FumigationProvider>
      </FitnessProvider>
    </Providers>
  )
}

describe("business settings page", () => {
  it("keeps the settings information visible while KYB is incomplete", async () => {
    const state = structuredClone(returningBusinessState)
    state.stage = "setup"
    if (state.profile) {
      state.profile.phone = ""
      state.profile.premises = undefined
    }
    createBusinessStorage(localStorage).write(state)

    renderSettings()

    expect(
      await screen.findByRole("heading", { name: "Settings" })
    ).toBeVisible()
    expect(
      screen.getByRole("tab", { name: "Business profile" })
    ).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "Account" })).toBeVisible()
    expect(screen.getByRole("tab", { name: "Security" })).toBeVisible()
    expect(screen.getByRole("tab", { name: "Notifications" })).toBeVisible()
    expect(screen.getByRole("tab", { name: "Advanced" })).toBeVisible()
    expect(
      screen.queryByRole("heading", {
        name: "Complete business verification (KYB)",
      })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Upload avatar or logo" })
    ).toBeVisible()
    expect(
      screen.getByRole("heading", { name: "Premises and kitchen photos" })
    ).toBeVisible()
    expect(
      screen.getByRole("textbox", { name: "Registered business name" })
    ).toHaveValue("Riverside Kitchen & Foods")
    expect(
      screen.queryByRole("textbox", { name: "Contact person" })
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Premises name")).not.toBeInTheDocument()
    expect(document.querySelector('[data-slot="page-header"]')).not.toHaveClass(
      "border-b"
    )
    expect(document.querySelector('[data-slot="tabs-list"]')).not.toHaveClass(
      "border-b"
    )
    expect(
      document.querySelector('[data-slot="separator"]')
    ).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.clear(
      screen.getByRole("textbox", { name: "Registered business name" })
    )
    await user.type(
      screen.getByRole("textbox", { name: "Registered business name" }),
      "Riverside Market"
    )
    await user.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() =>
      expect(
        createBusinessStorage(localStorage).read().profile?.businessName
      ).toBe("Riverside Market")
    )

    await user.click(screen.getByRole("tab", { name: "Account" }))
    expect(screen.getByRole("textbox", { name: "Owner name" })).toHaveValue(
      "Ada Okafor"
    )
    expect(
      screen.queryByRole("textbox", { name: "Phone number" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/Changes to the verified email require/)
    ).toBeVisible()
    expect(screen.queryByText(/email or phone/)).not.toBeInTheDocument()
  })

  it("opens KYB as a full-page, dismissible workflow over settings", async () => {
    const state = structuredClone(returningBusinessState)
    state.stage = "setup"
    createBusinessStorage(localStorage).write(state)
    window.history.replaceState(null, "", "/business/settings#kyb")

    renderSettings()

    expect(
      await screen.findByRole("heading", {
        name: "Settings",
        hidden: true,
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("tab", { name: "Business verification" })
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole("tab", { hidden: true })).toHaveLength(5)
    expect(
      screen.getByRole("tab", { name: "Business profile", hidden: true })
    ).toHaveAttribute("aria-selected", "true")
    const dialog = await screen.findByRole("dialog", {
      name: "Complete business verification (KYB)",
    })
    expect(dialog).toHaveClass("fixed", "inset-0")
    expect(within(dialog).getByText("Step 01")).toHaveAttribute(
      "aria-current",
      "step"
    )
    const kybHeading = within(dialog).getByRole("heading", {
      name: "Complete business verification (KYB)",
    })
    expect(kybHeading).toBeVisible()
    expect(
      within(kybHeading.closest("form")!).getByLabelText("Premises name")
    ).toHaveValue("Riverside Kitchen")
    await userEvent.setup().click(
      within(dialog).getByRole("button", {
        name: "Close business verification",
      })
    )
    expect(window.location.hash).toBe("")
    expect(
      screen.queryByRole("heading", {
        name: "Complete business verification (KYB)",
      })
    ).not.toBeInTheDocument()

    act(() => {
      window.history.replaceState(null, "", "/business/settings#kyb")
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    })
    expect(
      await screen.findByRole("heading", {
        name: "Complete business verification (KYB)",
      })
    ).toBeVisible()
    const reopenedDialog = await screen.findByRole("dialog", {
      name: "Complete business verification (KYB)",
    })
    const user = userEvent.setup()
    await user.click(
      within(reopenedDialog).getByRole("button", { name: "Continue" })
    )
    await user.click(
      within(reopenedDialog).getByRole("button", { name: "Continue" })
    )
    await user.click(
      within(reopenedDialog).getByRole("button", { name: "Complete KYB" })
    )

    await waitFor(() =>
      expect(createBusinessStorage(localStorage).read().stage).toBe("complete")
    )
    expect(
      await screen.findByRole("tab", { name: "Business profile" })
    ).toHaveAttribute("aria-selected", "true")
  })

  it("shows verified account details and persists notification choices", async () => {
    renderSettings()
    expect(
      await screen.findByRole("heading", { name: "Settings" })
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
    expect(
      screen.queryByRole("textbox", { name: "Council" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("textbox", { name: "Email address" })
    ).toHaveAttribute("readonly")
    await user.click(screen.getByRole("tab", { name: "Business profile" }))
    expect(screen.getByRole("textbox", { name: "Council" })).toHaveValue(
      "Port Harcourt City"
    )
    expect(
      screen.getByRole("textbox", { name: "Business reference" })
    ).toHaveValue("BUS-001")
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

  it("provides frontend-only password and two-factor security flows", async () => {
    renderSettings()
    const user = userEvent.setup()
    await screen.findByRole("heading", { name: "Settings" })
    await user.click(screen.getByRole("tab", { name: "Security" }))

    await user.type(screen.getByLabelText("Current password"), "current-pass")
    await user.type(screen.getByLabelText("New password"), "new-password-1")
    await user.type(
      screen.getByLabelText("Confirm new password"),
      "new-password-1"
    )
    await user.click(screen.getByRole("button", { name: "Change password" }))
    expect(await screen.findByText("Password changed")).toBeVisible()

    await user.click(
      screen.getByRole("button", { name: "Set up two-factor authentication" })
    )
    const dialog = screen.getByRole("dialog", {
      name: "Set up two-factor authentication",
    })
    expect(within(dialog).getByText(/Scan this code/)).toBeVisible()
    await user.type(
      within(dialog).getByLabelText("Verification code"),
      "123456"
    )
    await user.click(within(dialog).getByRole("button", { name: "Enable 2FA" }))
    expect(
      await screen.findByText("Two-factor authentication is enabled")
    ).toBeVisible()
  })

  it("edits and saves business profile fields directly on the profile tab", async () => {
    renderSettings()
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
    await user.click(screen.getByRole("tab", { name: "Advanced" }))
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

  it("resets application progress while preserving the business and kitchen staff", async () => {
    createFitnessStore().write("BUS-001", {
      handlers: [
        {
          id: "handler-1",
          fullName: "Tari Briggs",
          sex: "Female",
          dateOfBirth: "1993-05-12",
          role: "Cook",
          identityNumber: "ID-001",
          phone: "08031230001",
          premisesName: "Riverside Kitchen",
          consent: true,
        },
      ],
      application: {
        id: "fitness-application-1",
        handlerIds: ["handler-1"],
        stage: "draft",
      },
    })
    createFumigationStore().write("BUS-001", {
      application: {
        id: "fumigation-application-1",
        requestedPeriod: "October 2026",
        declaration: true,
        stage: "draft",
      },
    })
    createInspectionStore().write("BUS-001", {
      inspection: {
        id: "inspection-1",
        councilId: "phc",
        premisesName: "Riverside Kitchen",
        stage: "notice-served",
        notice: {
          reference: "INS-001",
          scheduledAt: "2026-10-10T09:00:00Z",
        },
        findings: [],
      },
    })
    renderSettings()
    const user = userEvent.setup()
    await screen.findByRole("heading", { name: "Settings" })
    await user.click(screen.getByRole("tab", { name: "Advanced" }))
    await user.click(
      screen.getByRole("button", { name: "Reset application progress" })
    )

    const dialog = screen.getByRole("alertdialog", {
      name: "Reset application progress?",
    })
    expect(dialog).toHaveTextContent(
      "Your business profile and kitchen staff will stay"
    )
    await user.click(screen.getByRole("button", { name: "Reset progress" }))

    await waitFor(() => {
      expect(createFitnessStore().read("BUS-001")).toEqual({
        handlers: [expect.objectContaining({ id: "handler-1" })],
        application: null,
      })
      expect(createFumigationStore().read("BUS-001")).toEqual({
        application: null,
      })
      expect(createInspectionStore().read("BUS-001")).toEqual({
        inspection: null,
      })
    })
    expect(await screen.findByText("Application progress reset")).toBeVisible()
  })
})
