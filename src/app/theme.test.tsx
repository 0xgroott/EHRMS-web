import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { ThemeProvider, themeStorageKey, useTheme } from "./theme"

function ThemeHarness() {
  const { theme, setTheme } = useTheme()
  return (
    <button type="button" onClick={() => setTheme("dark")}>
      {theme}
    </button>
  )
}

afterEach(() => {
  document.documentElement.classList.remove("dark")
  document.documentElement.style.colorScheme = ""
})

describe("ThemeProvider", () => {
  it("uses Light when no preference has been saved", async () => {
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    expect(await screen.findByRole("button", { name: "light" })).toBeVisible()
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("restores a saved Dark preference", async () => {
    localStorage.setItem(themeStorageKey, "dark")

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "dark" })).toBeVisible()
    )
    expect(document.documentElement).toHaveClass("dark")
    expect(document.documentElement.style.colorScheme).toBe("dark")
  })

  it("applies and persists a changed preference", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    await user.click(await screen.findByRole("button", { name: "light" }))

    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem(themeStorageKey)).toBe("dark")
  })
})
