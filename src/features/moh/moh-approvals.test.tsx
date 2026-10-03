import { act, fireEvent, render, screen, within } from "@testing-library/react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { filterAndSortMohSubmissions, mohSubmissions } from "./moh-approvals"
import { MohBusinessReview, MohDashboard } from "./moh-approval-pages"

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

describe("MOH Health Approval workflow", () => {
  it("lists businesses submitted after an EHO inspection", async () => {
    await renderWithRouter(<MohDashboard submissions={mohSubmissions} />)

    expect(
      screen.getByRole("heading", { name: "Health Approvals" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Submitted businesses" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        "Inspection work is complete and ready for your decision."
      )
    ).not.toBeInTheDocument()
    expect(screen.queryByText("12 submissions")).not.toBeInTheDocument()
    expect(
      screen.getByRole("tablist", { name: "Submission status" }).parentElement
    ).toHaveClass("overflow-y-hidden")
    expect(screen.getByText("Riverside Kitchen & Foods")).toBeInTheDocument()
    expect(screen.getByText("Creek View Bakery")).toBeInTheDocument()
    expect(mohSubmissions).toHaveLength(12)
    expect(screen.getAllByRole("link", { name: "Review" })).toHaveLength(12)
    expect(screen.getAllByLabelText(/business logo$/i)).toHaveLength(12)
    const table = screen.getByRole("table", { name: "Submitted businesses" })
    expect(
      within(
        within(table).getByRole("row", {
          name: /Riverside Kitchen & Foods/,
        })
      ).getByLabelText("KYB verified")
    ).toBeVisible()
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual([
      "Business",
      "Type and location",
      "Inspector",
      "Completed",
      "Status",
      "Action",
    ])
    expect(within(table).getAllByRole("row")).toHaveLength(13)
    expect(within(table).queryByText("PR-001")).not.toBeInTheDocument()
    expect(within(table).queryByText("INS-HA-1042")).not.toBeInTheDocument()
  })

  it("searches the submitted businesses", async () => {
    await renderWithRouter(<MohDashboard submissions={mohSubmissions} />)

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search submitted businesses" }),
      { target: { value: "Creek View" } }
    )

    expect(screen.getByText("Creek View Bakery")).toBeInTheDocument()
    expect(
      screen.queryByText("Riverside Kitchen & Foods")
    ).not.toBeInTheDocument()
    expect(screen.queryByText("1 submission")).not.toBeInTheDocument()
  })

  it("separates pending, completed, and rejected submissions", async () => {
    await renderWithRouter(
      <MohDashboard
        submissions={mohSubmissions}
        decisions={{
          "HA-REV-001": {
            outcome: "approved",
            decidedAt: "2026-09-29T10:00:00.000Z",
            certificateNumber: "HAC-2026-001",
          },
          "HA-REV-002": {
            outcome: "denied",
            decidedAt: "2026-09-29T11:00:00.000Z",
            reason: "Cold storage controls require correction.",
          },
        }}
      />
    )

    expect(screen.getByRole("tab", { name: "Pending 10" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    expect(
      screen.queryByText("Riverside Kitchen & Foods")
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Creek View Bakery")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("tab", { name: "Completed 1" }))
    expect(screen.getByText("Riverside Kitchen & Foods")).toBeInTheDocument()
    expect(screen.queryByText("Creek View Bakery")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("tab", { name: "Rejected 1" }))
    expect(screen.getByText("Creek View Bakery")).toBeInTheDocument()
    expect(
      screen.queryByText("Riverside Kitchen & Foods")
    ).not.toBeInTheDocument()
  })

  it("sorts submissions by business name and completion date", () => {
    expect(
      filterAndSortMohSubmissions(mohSubmissions, "", "business-desc")[0]
        .businessName
    ).toBe("Trans-Amadi Food Court")
    expect(
      filterAndSortMohSubmissions(mohSubmissions, "", "oldest")[0].inspection
        .completedAt
    ).toBe("2026-09-15")
  })

  it("shows the completed inspection and prerequisite certificates", async () => {
    await renderWithRouter(
      <MohBusinessReview
        submission={mohSubmissions[0]}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    expect(screen.getByText("Fumigation Certificate")).toBeInTheDocument()
    expect(screen.getByText("Fitness Certificates")).toBeInTheDocument()
    expect(screen.getByText("Inspection completed")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Approve business" })
    ).toBeEnabled()
  })

  it("approves a business for a Health Approval Certificate", async () => {
    const onApprove = vi.fn()
    await renderWithRouter(
      <MohBusinessReview
        submission={mohSubmissions[0]}
        onApprove={onApprove}
        onDeny={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Approve business" }))

    expect(onApprove).toHaveBeenCalledWith(mohSubmissions[0].id)
  })

  it("opens an approved certificate in a new tab", async () => {
    await renderWithRouter(
      <MohBusinessReview
        submission={mohSubmissions[0]}
        decision={{
          outcome: "approved",
          decidedAt: "2026-09-29T10:00:00.000Z",
          certificateNumber: "HAC-2026-001",
        }}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    const link = screen.getByRole("link", { name: /view certificate/i })
    expect(link).toHaveAttribute(
      "href",
      "/moh/businesses/HA-REV-001/certificate"
    )
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noreferrer")
  })

  it("does not offer a certificate before approval", async () => {
    await renderWithRouter(
      <MohBusinessReview
        submission={mohSubmissions[0]}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    expect(
      screen.queryByRole("link", { name: /view certificate/i })
    ).not.toBeInTheDocument()
  })

  it("requires a reason before denying a business", async () => {
    const onDeny = vi.fn()
    await renderWithRouter(
      <MohBusinessReview
        submission={mohSubmissions[0]}
        onApprove={vi.fn()}
        onDeny={onDeny}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Deny approval" }))
    const dialog = screen.getByRole("dialog", { name: "Deny Health Approval" })
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Submit denial" })
    )
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "Enter a reason for denying this Health Approval."
    )
    expect(onDeny).not.toHaveBeenCalled()

    fireEvent.change(within(dialog).getByLabelText("Reason for denial"), {
      target: { value: "Outstanding food storage controls." },
    })
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Submit denial" })
    )

    expect(onDeny).toHaveBeenCalledWith(
      mohSubmissions[0].id,
      "Outstanding food storage controls."
    )
  })
})
