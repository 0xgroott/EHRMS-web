import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { CopyValueButton } from "./copy-value-button"

describe("CopyValueButton", () => {
  const writeText = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    writeText.mockReset().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
  })

  afterEach(() => vi.useRealTimers())

  it("copies a value and resets its accessible feedback", async () => {
    render(<CopyValueButton value="0803 555 0115" label="phone number" />)

    fireEvent.click(screen.getByRole("button", { name: "Copy phone number" }))
    await act(async () => Promise.resolve())

    expect(writeText).toHaveBeenCalledWith("0803 555 0115")
    expect(
      screen.getByRole("button", { name: "Copied phone number" })
    ).toBeVisible()

    act(() => vi.advanceTimersByTime(3_000))
    expect(
      screen.getByRole("button", { name: "Copy phone number" })
    ).toBeVisible()
  })

  it("reports clipboard failures without losing the copy control", async () => {
    writeText.mockRejectedValueOnce(new Error("Clipboard unavailable"))
    render(<CopyValueButton value="hello@example.com" label="email address" />)

    fireEvent.click(screen.getByRole("button", { name: "Copy email address" }))
    await act(async () => Promise.resolve())

    expect(screen.getByRole("alert")).toHaveTextContent("Could not copy")
    expect(
      screen.getByRole("button", { name: "Copy email address" })
    ).toBeVisible()
  })
})
