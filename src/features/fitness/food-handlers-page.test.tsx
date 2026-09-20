import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FoodHandlersPage } from "./food-handlers-page"
import type { FitnessState } from "./fitness-types"

const mockedFitness = vi.hoisted(() => {
  const value: { isHydrated: boolean; state: FitnessState } = {
    isHydrated: true,
    state: { handlers: [], application: null },
  }
  return { value }
})

vi.mock("./fitness-context", () => ({
  useFitness: () => mockedFitness.value,
}))

describe("FoodHandlersPage", () => {
  it("guides a business with no food handlers to add its first staff record", () => {
    render(<FoodHandlersPage />)

    expect(screen.getByRole("heading", { name: "Food handlers" })).toBeVisible()
    expect(screen.getByText("No food handlers registered yet")).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Add food handler" })
    ).toHaveAttribute("href", "/business/food-handler/new")
  })

  it("lists saved handlers with readiness and Fitness coverage", () => {
    mockedFitness.value = {
      isHydrated: true,
      state: {
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Kitchen assistant",
            identityNumber: "NIN-12345678901",
            phone: "08030000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
        application: null,
      },
    }
    render(<FoodHandlersPage />)

    expect(screen.getByText("Ada Okafor")).toBeVisible()
    expect(screen.getByText("Kitchen assistant")).toBeVisible()
    expect(
      within(screen.getByRole("row", { name: /Ada Okafor/ })).getByText(
        "Ready to apply"
      )
    ).toBeVisible()
    expect(screen.getByText("No Fitness coverage")).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Start Fitness application" })
    ).toHaveAttribute("href", "/business/fitness/apply")
    expect(
      screen.getByRole("link", { name: "Edit Ada Okafor" })
    ).toHaveAttribute("href", "/business/food-handler/handler-ada")
  })

  it("keeps a paid application on its tracking route instead of restarting it", () => {
    mockedFitness.value = {
      isHydrated: true,
      state: {
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Kitchen assistant",
            identityNumber: "NIN-12345678901",
            phone: "08030000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
        application: {
          id: "fitness-application-1",
          handlerIds: ["handler-ada"],
          facilityId: "phc-health-centre",
          totalNgn: 12500,
          paymentReference: "DEMO-FITNESS-001",
          stage: "awaiting-facility",
        },
      },
    }
    render(<FoodHandlersPage />)

    expect(
      screen.getByRole("link", { name: "Track Fitness application" })
    ).toHaveAttribute("href", "/business/fitness/tracker")
    expect(
      screen.queryByRole("link", { name: "Start Fitness application" })
    ).not.toBeInTheDocument()
  })

  it("links an issued application to its certificate instead of restarting it", () => {
    mockedFitness.value = {
      isHydrated: true,
      state: {
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Kitchen assistant",
            identityNumber: "NIN-12345678901",
            phone: "08030000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
        application: {
          id: "fitness-application-1",
          handlerIds: ["handler-ada"],
          facilityId: "phc-health-centre",
          totalNgn: 12500,
          paymentReference: "DEMO-FITNESS-001",
          stage: "issued",
          certificate: {
            id: "DEMO-CERT-001",
            handlerIds: ["handler-ada"],
            councilId: "phc",
            issuedAt: "2026-09-19T00:00:00.000Z",
            expiresAt: "2027-09-19T00:00:00.000Z",
          },
        },
      },
    }
    render(<FoodHandlersPage />)

    expect(
      screen.getByRole("link", { name: "View Fitness certificate" })
    ).toHaveAttribute("href", "/business/fitness/certificate")
    expect(
      screen.queryByRole("link", { name: "Start Fitness application" })
    ).not.toBeInTheDocument()
  })

  it("keeps existing food-handler coverage visible during a renewal", () => {
    mockedFitness.value = {
      isHydrated: true,
      state: {
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Cook",
            identityNumber: "NIN-1",
            phone: "08030000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
        application: {
          id: "fitness-application-2",
          handlerIds: ["handler-ada"],
          stage: "draft",
        },
        history: [
          {
            id: "fitness-application-1",
            handlerIds: ["handler-ada"],
            stage: "issued",
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: ["handler-ada"],
              councilId: "phc",
              issuedAt: "2026-09-01",
              expiresAt: "2099-09-01",
            },
          },
        ],
      },
    }
    render(<FoodHandlersPage />)

    expect(screen.getByText("Covered by Fitness certificate")).toBeVisible()
  })
})
