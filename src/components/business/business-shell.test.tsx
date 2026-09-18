import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/providers"
import {
  returningBusinessState,
  emptyBusinessState,
} from "@/data/business-seeds"
import { createBusinessStorage } from "@/services/business-storage"
import { BusinessShell } from "./business-shell"
import { BusinessPortalAccess } from "./business-portal-access"
import { UpcomingModule } from "./upcoming-module"

const destinations = [
  ["Home", "/business/dashboard"],
  ["Food handlers", "/business/food-handlers"],
  ["Applications", "/business/applications"],
  ["Certificates", "/business/certificates"],
  ["Inspections", "/business/inspections"],
  ["Business profile", "/business/profile"],
]

function shell(path = "/business/applications") {
  const root = createRootRoute({
    component: () => (
      <Providers>
        <BusinessShell />
      </Providers>
    ),
  })
  const route = createRoute({
    getParentRoute: () => root,
    path: "/business/$module",
    component: () => <h1>Page content</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn())
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  )
  vi.stubGlobal("innerWidth", 1200)
  createBusinessStorage(localStorage).write(
    structuredClone(returningBusinessState)
  )
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("Business shell", () => {
  it("provides only the six business destinations and marks the current page", async () => {
    shell()
    const nav = await screen.findByRole("navigation", {
      name: "Business navigation",
    })
    expect(within(nav).getAllByRole("link")).toHaveLength(6)
    for (const [label, href] of destinations)
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      )
    expect(
      within(nav).getByRole("link", { name: "Applications" })
    ).toHaveAttribute("aria-current", "page")
    expect(within(nav).getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    )
    for (const label of [
      "Finance",
      "Users",
      "Council administration",
      "Demo role",
    ])
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    expect(await screen.findByText("Riverside Kitchen & Foods")).toBeVisible()
    expect(screen.getAllByRole("main")).toHaveLength(1)
  })

  it("collapses desktop navigation and retains accessible link names", async () => {
    shell()
    const user = userEvent.setup()
    await user.click(
      await screen.findByRole("button", { name: "Toggle business navigation" })
    )
    expect(
      document.querySelector('[data-slot="sidebar"][data-state="collapsed"]')
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Food handlers" })).toHaveAttribute(
      "href",
      "/business/food-handlers"
    )
  })

  it("opens a mobile sheet and closes it when a destination is selected", async () => {
    vi.stubGlobal("innerWidth", 390)
    shell()
    const user = userEvent.setup()
    const trigger = await screen.findByRole("button", {
      name: "Open business navigation",
    })
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
    await user.click(trigger)
    const dialog = await screen.findByRole("dialog")
    expect(
      within(dialog).getByRole("navigation", { name: "Business navigation" })
    ).toBeVisible()
    await user.click(
      within(dialog).getByRole("link", { name: "Food handlers" })
    )
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })
})

describe("Business portal access", () => {
  it.each([
    ["missing account", emptyBusinessState, "/business/sign-in"],
    [
      "account draft",
      { ...returningBusinessState, stage: "account" },
      "/business/register",
    ],
    [
      "verification",
      { ...returningBusinessState, stage: "verification" },
      "/business/verify",
    ],
    [
      "unverified contact",
      {
        ...returningBusinessState,
        profile: { ...returningBusinessState.profile, verified: false },
      },
      "/business/verify",
    ],
    ["setup", { ...returningBusinessState, stage: "setup" }, "/business/setup"],
    [
      "missing premises",
      {
        ...returningBusinessState,
        profile: { ...returningBusinessState.profile, premises: undefined },
      },
      "/business/setup",
    ],
  ])(
    "redirects %s once without rendering protected content",
    async (_name, state, expected) => {
      localStorage.setItem("ehrcms:business:v1", JSON.stringify(state))
      const assign = vi.fn()
      vi.stubGlobal("location", { assign })
      render(
        <Providers>
          <BusinessPortalAccess>
            <h1>Protected content</h1>
          </BusinessPortalAccess>
        </Providers>
      )
      expect(screen.getByRole("status")).toBeVisible()
      expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
      await waitFor(() => expect(assign).toHaveBeenCalledWith(expected))
      expect(assign).toHaveBeenCalledTimes(1)
      expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
    }
  )

  it("admits a completed account only after hydration", async () => {
    const assign = vi.fn()
    vi.stubGlobal("location", { assign })
    render(
      <Providers>
        <BusinessPortalAccess>
          <h1>Protected content</h1>
        </BusinessPortalAccess>
      </Providers>
    )
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
    expect(
      await screen.findByRole("heading", { name: "Protected content" })
    ).toBeVisible()
    expect(assign).not.toHaveBeenCalled()
  })
})

describe("Upcoming module", () => {
  it("explains delivery timing and provides a working dashboard destination", () => {
    render(
      <UpcomingModule
        title="Food handlers"
        description="Add and manage the people who handle food at your premises."
        delivery="Slice 2 · Food handlers and Fitness Certificate"
      />
    )
    expect(
      screen.getByRole("heading", { level: 1, name: "Food handlers" })
    ).toBeVisible()
    expect(
      screen.getByText("Slice 2 · Food handlers and Fitness Certificate")
    ).toBeVisible()
    expect(screen.getByText(/Add and manage/)).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Return to dashboard" })
    ).toHaveAttribute("href", "/business/dashboard")
  })
})
