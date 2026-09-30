import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { assignments } from "./eho-model"
import { createDraft } from "./eho-state"
import { createTaskProgress } from "./eho-task-progress"
import {
  EhoSignInForm,
  InspectionCertificateGrid,
  InspectionOverviewCard,
} from "./eho-pages"

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

  it("opens a prefilled notice before sending an unserved notice", () => {
    const onProgressChange = vi.fn()
    render(
      <InspectionOverviewCard
        assignment={assignments[1]}
        draft={createDraft(assignments[1])}
        progress={createTaskProgress(assignments[1])}
        followUpRequired={false}
        followUpCompleted={false}
        onProgressChange={onProgressChange}
        onStart={vi.fn()}
        onStartFollowUp={vi.fn()}
        onSubmitWork={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Send notice" }))
    const dialog = screen.getByRole("dialog", {
      name: "Send inspection notice",
    })
    expect(
      within(dialog).getByLabelText<HTMLTextAreaElement>("Notice message").value
    ).toContain("Garden City Cold Stores")
    fireEvent.click(within(dialog).getByRole("button", { name: "Send notice" }))
    expect(onProgressChange).toHaveBeenCalledWith(
      expect.objectContaining({
        assignmentId: "EIN-102",
        noticeSentAt: expect.any(String),
      })
    )
    expect(screen.getByText(/notify the business/i)).toBeInTheDocument()
  })

  it("schedules an appointment no earlier than seven days after acknowledgement", () => {
    const onProgressChange = vi.fn()
    const progress = {
      ...createTaskProgress(assignments[0]),
      acknowledgedAt: "2026-09-18T10:00:00.000Z",
      appointmentDate: undefined,
    }
    render(
      <InspectionOverviewCard
        assignment={assignments[0]}
        draft={createDraft(assignments[0])}
        progress={progress}
        followUpRequired={false}
        followUpCompleted={false}
        onProgressChange={onProgressChange}
        onStart={vi.fn()}
        onStartFollowUp={vi.fn()}
        onSubmitWork={vi.fn()}
      />
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Schedule appointment" })
    )
    const date = screen.getByLabelText("Appointment date")
    expect(date).toHaveAttribute("min", "2026-09-25")
    fireEvent.change(date, { target: { value: "2026-09-25" } })
    fireEvent.click(
      screen.getByRole("button", { name: "Schedule appointment" })
    )
    expect(onProgressChange).toHaveBeenCalledWith(
      expect.objectContaining({ appointmentDate: "2026-09-25" })
    )
  })

  it("opens available certificates in a new tab and keeps fumigation inactive before inspection", () => {
    const draft = createDraft(assignments[0])
    const { rerender } = render(
      <InspectionCertificateGrid assignment={assignments[0]} draft={draft} />
    )

    expect(
      screen.getByRole("link", { name: /Health Approval Certificate/i })
    ).toHaveAttribute("target", "_blank")
    expect(
      screen.queryByRole("link", { name: /Fumigation Certificate/i })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText("Fumigation Certificate").closest("article")
    ).toHaveAttribute("aria-disabled", "true")

    rerender(
      <InspectionCertificateGrid
        assignment={assignments[0]}
        draft={{ ...draft, status: "submitted" }}
      />
    )
    expect(
      screen.getByRole("link", { name: /Fumigation Certificate/i })
    ).toHaveAttribute("target", "_blank")
  })
})
