import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"
import { BusinessFormDrawer } from "./business-form-drawer"

it("labels the form drawer and calls close from its visible control", async () => {
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(
    <BusinessFormDrawer
      title="Add food handler"
      description="Enter the handler's details"
      onClose={onClose}
    >
      <p>Form content</p>
    </BusinessFormDrawer>
  )

  const dialog = screen.getByRole("dialog", { name: "Add food handler" })
  expect(dialog).toHaveTextContent("Enter the handler's details")
  expect(dialog).toHaveTextContent("Form content")
  await user.click(screen.getByRole("button", { name: "Close" }))
  expect(onClose).toHaveBeenCalledOnce()
})
