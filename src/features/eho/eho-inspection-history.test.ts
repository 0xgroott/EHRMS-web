import { describe, expect, it } from "vitest"
import { seedDatabase } from "@/data/seeds"
import type { Fieldwork } from "./eho-model"
import { initialFieldwork } from "./eho-state"
import { inspectionHistory } from "./eho-inspection-history"

const premises = (id: string) =>
  seedDatabase.premises.find((item) => item.id === id)!

describe("EHO premises inspection history", () => {
  it("shows completed local fieldwork and its recorded findings", () => {
    expect(
      inspectionHistory(premises("PR-004"), initialFieldwork(), "2026-09-20")
    ).toEqual([
      expect.objectContaining({
        id: "EIN-104",
        date: "2026-09-10",
        status: "Completed",
        findings: 1,
        href: "/eho/inspections/EIN-104/result",
      }),
    ])
  })

  it("excludes drafts and future scheduled seed rows", () => {
    expect(
      inspectionHistory(premises("PR-001"), initialFieldwork(), "2026-09-20")
    ).toEqual([])
  })

  it("keeps queued fieldwork distinct from completed council history", () => {
    const queued: Fieldwork = {
      assignmentId: "EIN-101",
      status: "queued",
      submittedAt: "2026-09-20T08:00:00.000Z",
      answers: {},
      notes: {},
      issues: [],
      attendingOfficers: ["Ebi Briggs"],
    }
    expect(
      inspectionHistory(premises("PR-002"), { "EIN-101": queued }, "2026-09-20")
    ).toEqual([
      expect.objectContaining({
        id: "EIN-101",
        status: "Queued locally",
        findings: 0,
      }),
    ])
  })
})
