import { render } from "@/test/render-with-router"
import { screen, within } from "@testing-library/react"
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

    expect(screen.getByRole("heading", { name: "Staff" })).toBeVisible()
    expect(screen.getByText("No staff registered yet")).toBeVisible()
    expect(screen.getByRole("link", { name: "Add staff" })).toHaveAttribute(
      "href",
      "/business/food-handler/new"
    )
  })

  it("lists staff with active status and Fitness test state", () => {
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
        "Active"
      )
    ).toBeVisible()
    expect(screen.getByText("Not approved")).toBeVisible()
    expect(screen.getByText("Not approved")).toHaveAttribute(
      "data-variant",
      "secondary"
    )
    expect(screen.getByRole("region", { name: "Staff list" })).toBeVisible()
    expect(
      screen.queryByRole("heading", { name: "Food handler records" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Readiness requires identity/)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Next step" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Start Fitness application" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Edit Ada Okafor" })
    ).toHaveAttribute("href", "/business/food-handler/handler-ada")
  })

  it("keeps a paid application in the records without a next-step card", () => {
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

    expect(screen.getByText("In progress")).toBeVisible()
    expect(screen.getByText("In progress")).toHaveAttribute(
      "data-variant",
      "warning"
    )
    expect(
      screen.queryByRole("link", { name: "Track Fitness application" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Start Fitness application" })
    ).not.toBeInTheDocument()
  })

  it("shows issued coverage without a next-step card", () => {
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

    expect(screen.getByText("Approved")).toBeVisible()
    expect(screen.getByText("Approved")).toHaveAttribute(
      "data-variant",
      "success"
    )
    expect(
      screen.queryByRole("link", { name: "View Fitness certificate" })
    ).not.toBeInTheDocument()
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

    expect(screen.getByText("Approved")).toBeVisible()
  })

  it("keeps earlier staff covered after a separate new-staff certificate is issued", () => {
    const ada = {
      id: "ada",
      fullName: "Ada Okafor",
      sex: "Female",
      dateOfBirth: "1991-04-12",
      role: "Cook",
      identityNumber: "NIN-1",
      phone: "08030000000",
      premisesName: "Riverside Kitchen",
      consent: true,
    }
    mockedFitness.value = {
      isHydrated: true,
      state: {
        handlers: [ada, { ...ada, id: "bola", fullName: "Bola James" }],
        application: {
          id: "fitness-application-2",
          handlerIds: ["bola"],
          purpose: "new-staff",
          stage: "issued",
          certificate: {
            id: "FIT-CERT-2",
            handlerIds: ["bola"],
            councilId: "phc",
            issuedAt: "2026-09-01",
            expiresAt: "2099-09-01",
          },
        },
        history: [
          {
            id: "fitness-application-1",
            handlerIds: ["ada"],
            stage: "issued",
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: ["ada"],
              councilId: "phc",
              issuedAt: "2026-01-01",
              expiresAt: "2099-01-01",
            },
          },
        ],
      },
    }
    render(<FoodHandlersPage />)

    expect(
      within(screen.getByRole("row", { name: /Ada Okafor/ })).getByText(
        "Approved"
      )
    ).toBeVisible()
    expect(
      within(screen.getByRole("row", { name: /Bola James/ })).getByText(
        "Approved"
      )
    ).toBeVisible()
  })
})
