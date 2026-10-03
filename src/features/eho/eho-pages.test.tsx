import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { assignments } from "./eho-model"
import { createDraft } from "./eho-state"
import { createTaskProgress } from "./eho-task-progress"
import {
  EhoSignInForm,
  EhoCompliancePage,
  InspectionCertificateGrid,
  InspectionOverviewCard,
} from "./eho-pages"

vi.mock("./eho-session", () => ({
  useEho: () => ({
    officer: { id: "EHO-001", councilId: "phc" },
    fieldwork: {},
    claimAssignment: vi.fn(),
  }),
}))

describe("EHO entry and inspection readiness", () => {
  it("shows the shared premises profile without the redundant offline strip", () => {
    window.history.replaceState(
      window.history.state,
      "",
      "/eho/premises/PR-015?source=search"
    )
    render(<EhoCompliancePage premisesId="PR-015" />)

    expect(
      screen.getByRole("complementary", { name: "Business overview" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "contact@borokiriclinic.ng" })
    ).toBeVisible()
    expect(screen.getByRole("link", { name: "0803 555 0115" })).toBeVisible()
    expect(screen.getByLabelText("KYB verified")).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Copy email address" })
    ).toBeVisible()
    expect(
      screen.queryByText(/certificate and document details may be stale/i)
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Business info",
      "Inspection history · 1",
      "Certificates · 2",
      "Documents · 4",
    ])
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "data-variant",
      "default"
    )
    expect(screen.getByRole("tablist")).toHaveClass("h-11!")
    expect(
      screen.getByRole("region", { name: "Business information" })
    ).toBeVisible()
    expect(
      document
        .querySelector('[data-slot="premises-tab-panel"]')
        ?.contains(document.querySelector('[data-slot="premises-tabs"]'))
    ).toBe(false)
    expect(
      document.querySelector('[data-slot="premises-tab-panel"]')
    ).toHaveClass("min-h-80", "lg:min-h-[31.5rem]")
    expect(
      screen.queryByRole("tab", { name: "Findings" })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("tab", { name: "Inspection history · 1" }))
    expect(screen.getByText("Council findings")).toBeVisible()
    expect(screen.getByText("Assign this job")).toBeVisible()
    fireEvent.click(screen.getByRole("tab", { name: "Certificates · 2" }))
    expect(
      screen.getByRole("region", { name: "Health Approval" })
    ).toBeVisible()
    expect(
      screen.getByRole("region", { name: "Fumigation Certificate" })
    ).toBeVisible()
    expect(
      screen.getByRole("link", {
        name: "Open Health Approval HC-1015",
      })
    ).toHaveAttribute(
      "href",
      "/eho/premises/PR-015?source=search&certificate=HC-1015"
    )
    expect(
      screen.getByRole("link", { name: "Open Health Approval HC-1015" })
    ).toHaveAttribute("target", "_blank")
    expect(
      screen.getByRole("button", { name: "Record paper certificate seen" })
    ).toBeVisible()
    fireEvent.click(screen.getByRole("tab", { name: "Documents · 4" }))
    expect(
      screen.getByRole("heading", { name: "Premises and kitchen photos" })
    ).toBeVisible()
    expect(
      screen.queryByRole("button", { name: /edit|upload|remove/i })
    ).not.toBeInTheDocument()
  })

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
