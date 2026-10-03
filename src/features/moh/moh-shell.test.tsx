import { act, render, screen, within } from "@testing-library/react"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/app/theme"
import { MohHeader } from "./moh-header"
import { MohSidebar } from "./moh-sidebar"

async function renderWithRouter(ui: ReactNode) {
  const root = createRootRoute({ component: () => ui })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })
  await act(() => router.load())
  return render(<RouterProvider router={router} />)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("MOH shell", () => {
  it("shows the current page in the navigation and header", async () => {
    vi.stubGlobal("innerWidth", 1200)
    vi.stubGlobal("scrollTo", vi.fn())
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    )
    const signOut = vi.fn()
    await renderWithRouter(
      <ThemeProvider>
        <SidebarProvider>
          <MohSidebar pathname="/moh/health-approvals" />
          <SidebarInset>
            <MohHeader
              title="Health approvals"
              accountName="Dr. Ibiwari Briggs"
              councilName="Port Harcourt City"
              onSignOut={signOut}
            />
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    )

    const nav = screen.getByRole("navigation", { name: "MOH navigation" })
    expect(
      within(nav).getByRole("link", { name: "Health approvals" })
    ).toHaveAttribute("href", "/moh/health-approvals")
    expect(
      within(nav).getByRole("link", { name: "Health approvals" })
    ).toHaveAttribute("aria-current", "page")
    expect(
      within(nav).getByRole("link", { name: "Inspections" })
    ).toHaveAttribute("href", "/moh/inspections")
    expect(within(nav).getByRole("link", { name: "Premises" })).toHaveAttribute(
      "href",
      "/moh/businesses"
    )
    expect(
      within(nav).queryByRole("link", { name: "Dashboard" })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Toggle MOH navigation" })
    ).toBeVisible()
    expect(
      within(screen.getByRole("banner")).getByText("Health approvals")
    ).toBeVisible()
    expect(screen.queryByText("Dr. Ibiwari Briggs")).not.toBeInTheDocument()
    expect(
      screen.queryByText("Port Harcourt City Council")
    ).not.toBeInTheDocument()

    expect(screen.getByRole("button", { name: "MOH account" })).toBeVisible()
  })
})
