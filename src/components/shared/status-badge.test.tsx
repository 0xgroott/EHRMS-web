import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { StatusBadge } from "./status-badge"

it("exposes a machine-readable status without hiding its label", () => {
  render(<StatusBadge status="Not Found" />)
  expect(screen.getByText("Not Found")).toBeVisible()
  expect(screen.getByText("Not Found")).toHaveAttribute(
    "data-status",
    "not-found"
  )
})
