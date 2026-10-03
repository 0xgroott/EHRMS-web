import { act, fireEvent, render, screen, within } from "@testing-library/react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mohHealthApprovalCases } from "./moh-health-approval-worklist"
import {
  MohHealthApprovalCaseDetail,
  MohHealthApprovalWorklist,
} from "./moh-health-approval-pages"

beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()))
afterEach(() => vi.unstubAllGlobals())

async function renderWithRouter(ui: ReactNode) {
  const root = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })
  await act(() => router.load())
  return render(<RouterProvider router={router} />)
}

describe("MOH Health Approval pre-decision pages", () => {
  it("separates inspections awaiting assignment from those in progress", async () => {
    await renderWithRouter(
      <MohHealthApprovalWorklist cases={mohHealthApprovalCases} />
    )

    expect(
      screen.getByRole("heading", { name: "Inspections" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("tab", { name: "Awaiting assignment 4" })
    ).toHaveAttribute("aria-selected", "true")
    const table = screen.getByRole("table", { name: "Inspection cases" })
    expect(table).toBeInTheDocument()
    expect(
      within(table).getByText("Abonnema Wharf Canteen")
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("tab", { name: "Scheduled & in progress 3" })
    )
    expect(
      within(screen.getByRole("table", { name: "Inspection cases" })).getByText(
        "Azikiwe Road Eatery"
      )
    ).toBeInTheDocument()

    expect(
      screen.queryByRole("tab", { name: /Decisions/ })
    ).not.toBeInTheDocument()
  })

  it("reuses KYB verification for a matching registered business", async () => {
    await renderWithRouter(
      <MohHealthApprovalWorklist
        cases={[
          {
            ...mohHealthApprovalCases[0],
            businessName: "Riverside Kitchen & Foods",
          },
        ]}
      />
    )

    expect(
      within(
        screen.getByRole("table", { name: "Inspection cases" })
      ).getByLabelText("KYB verified")
    ).toBeVisible()
  })

  it("shows the evidence that makes a premises eligible", async () => {
    const eligible = mohHealthApprovalCases[0]
    await renderWithRouter(
      <MohHealthApprovalCaseDetail workCase={eligible} onSchedule={vi.fn()} />
    )

    expect(
      screen.getByRole("heading", { name: eligible.businessName })
    ).toBeInTheDocument()
    expect(screen.getByText("Fitness Certificate")).toBeInTheDocument()
    expect(screen.getByText(eligible.fitness.reference)).toBeInTheDocument()
    expect(screen.getByText("Fumigation Certificate")).toBeInTheDocument()
    expect(screen.getByText(eligible.fumigation.reference)).toBeInTheDocument()
    expect(screen.getByText("Previous inspection")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Schedule approval inspection" })
    ).toBeEnabled()
  })

  it("requires the scheduling fields before submission", async () => {
    await renderWithRouter(
      <MohHealthApprovalCaseDetail
        workCase={mohHealthApprovalCases[0]}
        onSchedule={vi.fn()}
      />
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Schedule approval inspection" })
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm inspection schedule" })
    )

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose an Environmental Health Officer and inspection date."
    )
  })

  it("tracks a scheduled inspection without exposing fieldwork actions", async () => {
    const inspection = mohHealthApprovalCases.find(
      (item) => item.stage === "inspection"
    )!
    await renderWithRouter(
      <MohHealthApprovalCaseDetail workCase={inspection} onSchedule={vi.fn()} />
    )

    expect(
      screen.getByRole("heading", { name: "Inspection progress" })
    ).toBeInTheDocument()
    expect(screen.getByText("Eligibility confirmed")).toBeInTheDocument()
    expect(screen.getByText("Inspection notice served")).toBeInTheDocument()
    expect(screen.getByText(inspection.inspection!.officer)).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /start inspection/i })
    ).not.toBeInTheDocument()
  })
})
