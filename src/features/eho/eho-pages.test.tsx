import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { assignments } from "./eho-model"
import { createDraft } from "./eho-state"
import { EhoSignInForm, InspectionOverviewCard } from "./eho-pages"

describe("EHO entry and inspection readiness", () => {
  it("signs in an assigned officer without an account creation action", () => {
    const onSuccess = vi.fn()
    render(<EhoSignInForm onSuccess={onSuccess} />)
    expect(screen.queryByText(/create account/i)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/staff id or email/i), {
      target: { value: "EHO-001" },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "field-demo" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(onSuccess).toHaveBeenCalledWith("EHO-001")
  })

  it("explains an unserved notice and prevents starting", () => {
    render(
      <InspectionOverviewCard
        assignment={assignments[1]}
        draft={createDraft(assignments[1])}
        onStart={vi.fn()}
      />
    )
    expect(
      screen.getByRole("button", { name: "Start inspection" })
    ).toBeDisabled()
    expect(screen.getByText(/notice must be served/i)).toBeInTheDocument()
  })
})
