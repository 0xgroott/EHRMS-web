import { act, fireEvent, render, screen, within } from "@testing-library/react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { seedDatabase } from "@/data/seeds"
import {
  buildMohBusinessDirectory,
  filterAndSortMohBusinesses,
  MohBusinessesDirectory,
  MohPremisesOverview,
} from "./moh-businesses"

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

describe("MOH businesses directory", () => {
  it("summarises the registered businesses for the MOH council", () => {
    const businesses = buildMohBusinessDirectory(seedDatabase.premises, "phc")

    expect(businesses).toHaveLength(10)
    expect(businesses.find((item) => item.id === "PR-001")).toMatchObject({
      stage: "Health Approval issued",
      status: "Compliant",
      kybVerified: true,
    })
    expect(businesses.find((item) => item.id === "PR-003")).toMatchObject({
      stage: "Corrective action required",
      status: "Non-compliant",
    })
    expect(businesses.find((item) => item.id === "PR-004")).toMatchObject({
      stage: "Fitness certification",
      status: "Pending",
    })
  })

  it("keeps council summary totals stable while filtering the directory", async () => {
    const businesses = buildMohBusinessDirectory(seedDatabase.premises, "phc")
      .slice(0, 5)
      .map((business, index) => ({
        ...business,
        status: (
          [
            "Compliant",
            "Non-compliant",
            "Suspended",
            "Pending",
            "Expiring soon",
          ] as const
        )[index],
      }))
    await renderWithRouter(
      <MohBusinessesDirectory businesses={businesses} showMetrics />
    )
    const summary = screen.getByRole("region", { name: "Premises summary" })
    const cards = within(summary).getAllByText(
      /^(Registered|Action required|Pending|Expiring soon)$/
    )
    expect(cards.map((card) => card.textContent)).toEqual([
      "Registered",
      "Action required",
      "Pending",
      "Expiring soon",
    ])
    const values = () =>
      cards.map(
        (label) =>
          label.closest('[data-slot="card"]')?.querySelector("strong")
            ?.textContent
      )
    expect(values()).toEqual(["5", "2", "1", "1"])
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search premises" }),
      { target: { value: "no matching premises" } }
    )
    expect(values()).toEqual(["5", "2", "1", "1"])
  })

  it("shows zero summary totals when no premises are registered", async () => {
    await renderWithRouter(
      <MohBusinessesDirectory businesses={[]} showMetrics />
    )
    expect(
      within(
        screen.getByRole("region", { name: "Premises summary" })
      ).getAllByText("0")
    ).toHaveLength(4)
  })

  it("filters by business details and simplified status", () => {
    const businesses = buildMohBusinessDirectory(seedDatabase.premises, "phc")

    expect(
      filterAndSortMohBusinesses(
        businesses,
        "Bakery",
        "all",
        "all",
        "all",
        "business-asc"
      ).map((item) => item.id)
    ).toEqual(["PR-004"])
    expect(
      filterAndSortMohBusinesses(
        businesses,
        "",
        "Non-compliant",
        "all",
        "all",
        "business-asc"
      ).every((item) => item.status === "Non-compliant")
    ).toBe(true)
    expect(
      filterAndSortMohBusinesses(
        businesses,
        "PR-004",
        "all",
        "Town",
        "Bakery",
        "business-asc"
      ).map((item) => item.id)
    ).toEqual(["PR-004"])
  })

  it("shows every existing column and a view action for each premises", async () => {
    const businesses = buildMohBusinessDirectory(seedDatabase.premises, "phc")
    await renderWithRouter(<MohBusinessesDirectory businesses={businesses} />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Premises" })
    ).toBeInTheDocument()
    const table = screen.getByRole("table", { name: "Registered premises" })
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual(["Business", "Type", "Ward", "Current stage", "Status", "Action"])

    const firstRow = within(table).getByRole("row", {
      name: /Riverside Kitchen & Foods/,
    })
    expect(within(firstRow).getByLabelText("KYB verified")).toBeVisible()
    expect(
      within(
        within(table).getByRole("row", { name: /Trans-Amadi Food Court/ })
      ).queryByLabelText("KYB verified")
    ).not.toBeInTheDocument()
    expect(
      within(firstRow).getByRole("button", { name: "View" })
    ).toHaveAttribute("href", "/moh/businesses/PR-001?source=search")

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search premises" }),
      { target: { value: "Creek View" } }
    )
    expect(within(table).getByText("Creek View Bakery")).toBeInTheDocument()
    expect(
      within(table).queryByText("Riverside Kitchen & Foods")
    ).not.toBeInTheDocument()
  })

  it("offers EHO-style directory filters and clear controls", async () => {
    const businesses = buildMohBusinessDirectory(seedDatabase.premises, "phc")
    await renderWithRouter(<MohBusinessesDirectory businesses={businesses} />)

    expect(screen.getByText("10 premises")).toBeInTheDocument()
    expect(
      screen.getByRole("combobox", { name: "Filter by ward" })
    ).toBeVisible()
    expect(
      screen.getByRole("combobox", { name: "Filter by business type" })
    ).toBeVisible()
    expect(
      screen.getByRole("combobox", { name: "Filter by status" })
    ).toBeVisible()
    expect(
      screen.getByRole("combobox", { name: "Sort premises" })
    ).toBeVisible()

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search premises" }),
      {
        target: { value: "PR-004" },
      }
    )
    expect(screen.getByText("1 premises")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(screen.getByText("10 premises")).toBeInTheDocument()
  })

  it("shows the premises overview with the EHO overview sections", async () => {
    window.history.replaceState(
      window.history.state,
      "",
      "/moh/businesses/PR-015?source=search"
    )
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!
    await renderWithRouter(<MohPremisesOverview premises={premises} />)

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Borokiri Community Clinic",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("complementary", { name: "Business overview" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "contact@borokiriclinic.ng" })
    ).toBeVisible()
    expect(screen.getByRole("link", { name: "0803 555 0115" })).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Copy email address" })
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Copy phone number" })
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Back to premises" })
    ).toHaveAttribute("href", "/moh/businesses")
    expect(
      document.querySelector('[data-slot="premises-workspace"]')
    ).toHaveClass("gap-10")
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Business info",
      "Inspection history · 1",
      "Certificates · 2",
      "Documents · 4",
    ])
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "data-variant",
      "default"
    )
    expect(screen.getByRole("tablist")).toHaveClass("h-11!")
    expect(
      screen.getByRole("region", { name: "Business information" })
    ).toBeVisible()
    expect(document.querySelector('[data-slot="premises-tabs"]')).not.toBe(
      document.querySelector('[data-slot="premises-tab-panel"]')
    )
    expect(
      document
        .querySelector('[data-slot="premises-tab-panel"]')
        ?.contains(document.querySelector('[data-slot="premises-tabs"]'))
    ).toBe(false)
    expect(
      document.querySelector('[data-slot="premises-tab-panel"]')
    ).toHaveClass("min-h-80", "lg:min-h-[31.5rem]")
    expect(
      screen.queryByRole("tab", { name: "Findings" })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("tab", { name: "Inspection history · 1" }))
    expect(screen.getByText("Open findings")).toBeVisible()
    fireEvent.click(screen.getByRole("tab", { name: "Certificates · 2" }))
    expect(
      screen.getByRole("region", { name: "Health Approval" })
    ).toBeVisible()
    expect(
      screen.getByRole("region", { name: "Fumigation Certificate" })
    ).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Open Health Approval HC-1015" })
    ).toHaveAttribute(
      "href",
      "/moh/businesses/PR-015?source=search&certificate=HC-1015"
    )
    expect(
      screen.getByRole("link", { name: "Open Health Approval HC-1015" })
    ).toHaveAttribute("target", "_blank")
    fireEvent.click(screen.getByRole("tab", { name: "Documents · 4" }))
    expect(
      screen.getByRole("heading", { name: "Premises and kitchen photos" })
    ).toBeVisible()
    expect(screen.getAllByRole("img")).toHaveLength(3)
    expect(
      screen.queryByRole("button", { name: /edit|upload|remove/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/“Not Found” means no digital record/i)
    ).not.toBeInTheDocument()
  })

  it("opens a premises certificate in the existing read-only viewer", async () => {
    window.history.replaceState(
      window.history.state,
      "",
      "/moh/businesses/PR-015?source=search&certificate=HC-1015"
    )
    const premises = seedDatabase.premises.find((item) => item.id === "PR-015")!

    await renderWithRouter(<MohPremisesOverview premises={premises} />)

    expect(
      screen.getByRole("heading", { name: "Health Approval certificate" })
    ).toBeVisible()
    expect(screen.getByText("HC-1015")).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Back to premises certificates" })
    ).toHaveAttribute("href", "/moh/businesses/PR-015?source=search")
  })
})
