import type * as RouterModule from "@tanstack/react-router"
import { render as renderWithRouterContext } from "@/test/render-with-router"
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
import { BusinessMediaProvider } from "@/features/business-media/business-media-context"
import { BusinessPortalAccess } from "./business-portal-access"
import { UpcomingModule } from "./upcoming-module"

const destinations = [
  ["Home", "/business/dashboard"],
  ["Staff", "/business/food-handlers"],
  ["Applications", "/business/applications"],
  ["Certificates", "/business/certificates"],
  ["Settings", "/business/settings"],
]

function shell(path = "/business/applications") {
  const root = createRootRoute({
    component: () => (
      <Providers>
        <BusinessMediaProvider>
          <BusinessShell />
        </BusinessMediaProvider>
      </Providers>
    ),
  })
  const route = createRoute({
    getParentRoute: () => root,
    path: "/business/$module",
    component: () => <h1>Page content</h1>,
  })
  const fitnessTrackerRoute = createRoute({
    getParentRoute: () => root,
    path: "/business/fitness/tracker",
    component: () => <h1>Fitness tracker</h1>,
  })
  const fumigationTrackerRoute = createRoute({
    getParentRoute: () => root,
    path: "/business/fumigation/tracker",
    component: () => <h1>Fumigation tracker</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([
      route,
      fitnessTrackerRoute,
      fumigationTrackerRoute,
    ]),
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

const navigate = vi.hoisted(() => vi.fn())
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof RouterModule>()),
  useNavigate: () => navigate,
}))
describe("Business shell", () => {
  it("places the business account in the sidebar footer instead of the header", async () => {
    shell()
    const account = await screen.findByRole("button", {
      name: "Business account",
    })
    expect(account.closest('[data-slot="sidebar-footer"]')).not.toBeNull()
    expect(
      within(screen.getByRole("banner")).queryByRole("button", {
        name: "Business account",
      })
    ).not.toBeInTheDocument()
    expect(account).toHaveTextContent(
      returningBusinessState.profile!.contactName
    )
  })

  it("provides only the five business destinations and marks the current page", async () => {
    shell()
    const nav = await screen.findByRole("navigation", {
      name: "Business navigation",
    })
    expect(within(nav).getAllByRole("link")).toHaveLength(5)
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
    expect(
      within(nav).queryByRole("link", { name: "Inspections" })
    ).not.toBeInTheDocument()
    for (const label of ["Finance", "Users", "Council administration", "Role"])
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    expect(await screen.findByText("Riverside Kitchen & Foods")).toBeVisible()
    expect(screen.getAllByRole("main")).toHaveLength(1)
    expect(document.querySelector("#business-content")).toHaveClass("pb-20")
    expect(
      screen.queryByRole("region", { name: "Business verification required" })
    ).not.toBeInTheDocument()
  })

  it("shows a persistent KYB banner for verified businesses without completed details", async () => {
    const state = structuredClone(returningBusinessState)
    state.stage = "setup"
    if (state.profile) state.profile.premises = undefined
    createBusinessStorage(localStorage).write(state)

    shell("/business/dashboard")

    const banner = await screen.findByRole("region", {
      name: "Business verification required",
    })
    expect(banner).toHaveTextContent("Complete KYB to use the app")
    expect(banner).not.toHaveTextContent(
      "Add your business and premises details in Settings."
    )
    expect(banner).toHaveClass("rounded-xl", "bg-[var(--background-error)]")
    expect(banner.parentElement).toHaveAttribute("id", "business-content")
    expect(banner.querySelector("svg")).toHaveClass("size-8")
    expect(
      within(banner).getByRole("link", { name: "Complete KYB" })
    ).toHaveAttribute("href", "/business/settings#kyb")
  })

  it.each([
    "/business/food-handlers",
    "/business/applications",
    "/business/certificates",
  ])("does not show the KYB banner on %s", async (path) => {
    const state = structuredClone(returningBusinessState)
    state.stage = "setup"
    if (state.profile) state.profile.premises = undefined
    createBusinessStorage(localStorage).write(state)

    shell(path)

    await screen.findByRole("heading", { name: "Page content" })
    expect(
      screen.queryByRole("region", { name: "Business verification required" })
    ).not.toBeInTheDocument()
  })

  it("keeps the KYB banner on Settings", async () => {
    const state = structuredClone(returningBusinessState)
    state.stage = "setup"
    if (state.profile) state.profile.premises = undefined
    createBusinessStorage(localStorage).write(state)

    shell("/business/settings")

    expect(
      await screen.findByRole("region", {
        name: "Business verification required",
      })
    ).toBeVisible()
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
    expect(screen.getByRole("link", { name: "Staff" })).toHaveAttribute(
      "href",
      "/business/food-handlers"
    )
  })

  it.each([
    ["Fitness", "/business/fitness/tracker"],
    ["Fumigation", "/business/fumigation/tracker"],
  ])(
    "keeps Applications active throughout a %s application route",
    async (_name, path) => {
      shell(path)
      const nav = await screen.findByRole("navigation", {
        name: "Business navigation",
      })
      expect(
        within(nav).getByRole("link", { name: "Applications" })
      ).toHaveAttribute("aria-current", "page")
      expect(
        within(nav).getByRole("link", { name: "Home" })
      ).not.toHaveAttribute("aria-current")
    }
  )

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
    await user.click(within(dialog).getByRole("link", { name: "Staff" }))
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
  ])(
    "redirects %s once without rendering protected content",
    async (_name, state, expected) => {
      localStorage.setItem("ehrcms:business:v1", JSON.stringify(state))
      navigate.mockClear()
      render(
        <Providers>
          <BusinessPortalAccess>
            <h1>Protected content</h1>
          </BusinessPortalAccess>
        </Providers>
      )
      expect(screen.getByRole("status")).toBeVisible()
      expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({ to: expected, replace: true })
      )
      expect(navigate).toHaveBeenCalledTimes(1)
      expect(screen.queryByText("Protected content")).not.toBeInTheDocument()
    }
  )

  it("admits a verified account while KYB is still incomplete", async () => {
    const state = structuredClone(returningBusinessState)
    state.stage = "setup"
    if (state.profile) state.profile.premises = undefined
    createBusinessStorage(localStorage).write(state)
    navigate.mockClear()

    render(
      <Providers>
        <BusinessPortalAccess>
          <h1>Protected content</h1>
        </BusinessPortalAccess>
      </Providers>
    )

    expect(
      await screen.findByRole("heading", { name: "Protected content" })
    ).toBeVisible()
    expect(navigate).not.toHaveBeenCalled()
  })

  it("admits a completed account only after hydration", async () => {
    navigate.mockClear()
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
    expect(navigate).not.toHaveBeenCalled()
  })
})

describe("Upcoming module", () => {
  it("explains delivery timing and provides a working dashboard destination", () => {
    renderWithRouterContext(
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
