import type { MouseEventHandler, ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ThemeProvider } from "@/app/theme"
import { ThemeMenuGroup } from "./theme-menu-group"

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    role,
    "aria-checked": checked,
  }: {
    children: ReactNode
    onClick?: MouseEventHandler<HTMLButtonElement>
    role?: string
    "aria-checked"?: boolean
  }) => (
    <button type="button" role={role} aria-checked={checked} onClick={onClick}>
      {children}
    </button>
  ),
}))

describe("ThemeMenuGroup", () => {
  it("offers exclusive Light and Dark choices", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeMenuGroup />
      </ThemeProvider>
    )

    expect(screen.getByText("Theme")).toBeVisible()
    expect(
      screen.getByRole("menuitemradio", { name: "Light" })
    ).toHaveAttribute("aria-checked", "true")

    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }))
    expect(document.documentElement).toHaveClass("dark")
  })
})
