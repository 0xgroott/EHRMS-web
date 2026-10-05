import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { LinkedTableRow } from "./linked-table-row"
import { Table, TableBody, TableCell } from "@/components/ui/table"

function setup(extra?: React.ReactNode, disabled = false) {
  const open = vi.fn((event: React.MouseEvent) => event.preventDefault())
  render(
    <div tabIndex={-1}>
      <Table>
        <TableBody>
          <LinkedTableRow>
            <TableCell>Riverside Kitchen</TableCell>
            <TableCell>
              <a
                href="/premises/PR-001"
                aria-disabled={disabled || undefined}
                onClick={open}
                onAuxClick={open}
              >
                View
              </a>
              {extra}
            </TableCell>
          </LinkedTableRow>
        </TableBody>
      </Table>
    </div>
  )
  return open
}

afterEach(() => vi.restoreAllMocks())

describe("LinkedTableRow", () => {
  it("opens the existing link once when a data cell is clicked", () => {
    const open = setup()
    fireEvent.click(screen.getByText("Riverside Kitchen"))
    expect(open).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("row")).not.toHaveAttribute("tabindex")
    expect(screen.getByRole("link")).toHaveAttribute("href", "/premises/PR-001")
  })
  it("does not trigger a link twice when its action is clicked", () => {
    const open = setup()
    fireEvent.click(screen.getByRole("link"))
    expect(open).toHaveBeenCalledTimes(1)
  })
  it.each([
    { type: "click", button: 0, ctrlKey: true },
    { type: "click", button: 0, metaKey: true },
    { type: "click", button: 0, shiftKey: true },
    { type: "auxclick", button: 1 },
  ])(
    "opens a separate browsing context for $type $button modifiers",
    ({ type, ...options }) => {
      const openLink = setup()
      const openWindow = vi.spyOn(window, "open").mockReturnValue(null)
      fireEvent(
        screen.getByText("Riverside Kitchen"),
        new MouseEvent(type, { bubbles: true, ...options })
      )
      expect(openWindow).toHaveBeenCalledWith(
        new URL("/premises/PR-001", window.location.href).href,
        "_blank",
        "noopener,noreferrer"
      )
      expect(openLink).not.toHaveBeenCalled()
    }
  )
  it("does not navigate a row with multiple actions", () => {
    const open = setup(<button>Archive</button>)
    fireEvent.click(screen.getByText("Riverside Kitchen"))
    fireEvent.click(screen.getByRole("button"))
    expect(open).not.toHaveBeenCalled()
  })
  it("does not follow a disabled link", () => {
    const open = setup(undefined, true)
    fireEvent.click(screen.getByText("Riverside Kitchen"))
    expect(open).not.toHaveBeenCalled()
  })
  it("allows selecting and copying row text", () => {
    const open = setup()
    const selection = window.getSelection()!
    const range = document.createRange()
    range.selectNodeContents(screen.getByText("Riverside Kitchen"))
    selection.addRange(range)
    fireEvent.click(screen.getByText("Riverside Kitchen"))
    expect(open).not.toHaveBeenCalled()
    selection.removeAllRanges()
  })
})
