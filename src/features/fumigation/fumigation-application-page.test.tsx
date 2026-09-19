import { render, screen } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { FumigationApplicationPage } from "./fumigation-application-page"
import { FumigationProvider } from "./fumigation-context"

vi.mock("@/app/business-session", () => ({
  useBusinessSession: () => ({
    state: returningBusinessState,
    isHydrated: true,
  }),
}))

beforeEach(() => localStorage.clear())

it("uses a compact step heading inside the application drawer", () => {
  render(
    <FumigationProvider>
      <FumigationApplicationPage inDrawer />
    </FumigationProvider>
  )
  expect(
    screen.getByRole("heading", {
      name: "Start fumigation application",
      level: 2,
    })
  ).toBeVisible()
  expect(screen.queryByText("Fumigation Certificate")).not.toBeInTheDocument()
})
