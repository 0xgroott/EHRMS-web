import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PremisesInspectionTable } from "./premises-inspection-table"

describe("premises inspection history", () => {
  it("shows visit columns and distinguishes follow-ups without losing status", () => {
    render(
      <PremisesInspectionTable
        entries={[
          {
            id: "INS-1",
            date: "2026-09-22",
            officer: "Tamuno George",
            type: "Routine inspection",
            status: "Completed",
          },
          {
            id: "INS-2",
            date: "2026-10-01",
            officer: "",
            type: "Follow-up inspection",
            status: "Scheduled",
          },
        ]}
      />
    )
    const table = screen.getByRole("table", { name: "Inspection history" })
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent)
    ).toEqual([
      "Date of inspection",
      "Field officer",
      "Inspection type",
      "Reference",
      "Status",
    ])
    expect(within(table).getByText("22 Sept 2026")).toBeVisible()
    expect(within(table).getByText("Tamuno George")).toBeVisible()
    expect(within(table).getByText("Inspection", { exact: true })).toBeVisible()
    expect(within(table).getByText("Follow-up")).toBeVisible()
    expect(within(table).getByText("Officer unavailable")).toBeVisible()
    expect(within(table).getByText("Scheduled")).toBeVisible()
  })
  it("keeps findings available and handles empty history", () => {
    const { rerender } = render(
      <PremisesInspectionTable
        entries={[
          {
            id: "INS-1",
            date: "2026-09-22",
            officer: "Officer",
            type: "Inspection",
            status: "Completed",
            findings: 1,
          },
        ]}
      />
    )
    expect(screen.getByText("1 finding recorded")).toBeVisible()
    rerender(<PremisesInspectionTable entries={[]} />)
    expect(screen.getByText("No inspection history")).toBeVisible()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })
})
