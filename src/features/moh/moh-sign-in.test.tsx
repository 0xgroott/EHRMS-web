import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { assignedMohAccount, assignedMohCredentials } from "./moh-account"
import { MohAssignedAccountAccess } from "./moh-pages"

describe("MOH assigned account access", () => {
  it("shows the sign-in details and uses the assigned account in one click", () => {
    const onUse = vi.fn()
    render(<MohAssignedAccountAccess onUse={onUse} />)

    expect(screen.getByText(assignedMohAccount.id)).toBeInTheDocument()
    expect(screen.getByText(assignedMohAccount.email)).toBeInTheDocument()
    expect(
      screen.getByText(assignedMohCredentials.password)
    ).toBeInTheDocument()
    expect(
      screen.getByText(assignedMohCredentials.verificationCode)
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("button", { name: "Use assigned account" })
    )
    expect(onUse).toHaveBeenCalledWith(assignedMohAccount)
  })
})
