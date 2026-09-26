import { render, screen, waitFor } from "@testing-library/react"
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
  it("shows verified account details and persists notification choices", async () => {
    renderSettings()
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
    await screen.findByRole("heading", { name: "Business settings" })
    await user.click(screen.getByRole("tab", { name: "Account" }))
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
