import { describe, expect, it } from "vitest"
import { seedDatabase } from "@/data/seeds"
import { mohSubmissions } from "@/features/moh/moh-approvals"
import {
  createLgaCsv,
  filterLgaRows,
  financeTotals,
  getLgaData,
} from "./lga-data"

describe("LGA oversight data", () => {
  it("collects payments only for Fitness and Fumigation, never certificate approval", () => {
    for (const council of seedDatabase.councils) {
      const payments = getLgaData(council.id).payments
      expect(new Set(payments.map((row) => row.service))).toEqual(
        new Set(["Fitness", "Fumigation"])
      )
      expect(new Set(payments.map((row) => row.paidAt.slice(0, 7)))).toEqual(
        new Set(["2026-09", "2026-10"])
      )
    }
  })

  it("joins records to the assigned council, even when ward labels overlap", () => {
    const local = seedDatabase.premises[0]
    const foreign = { ...seedDatabase.premises[4], ward: local.ward }
    const data = getLgaData("phc", {
      database: { ...seedDatabase, premises: [local, foreign] },
      submissions: [
        { ...mohSubmissions[0], ward: "Wrong copied ward" },
        { ...mohSubmissions[0], id: "foreign", premisesId: foreign.id },
        { ...mohSubmissions[0], id: "unknown", premisesId: "missing" },
      ],
    })
    expect(data.premises.map((row) => row.id)).toEqual([local.id])
    expect(data.approvals).toHaveLength(1)
    expect(data.approvals[0]).toMatchObject({
      ward: local.ward,
      status: "Awaiting decision",
    })
    expect(data.inspections.every((row) => row.premisesId === local.id)).toBe(
      true
    )
    expect(data.payments.length).toBeGreaterThan(0)
    expect(data.payments.every((row) => row.premisesId === local.id)).toBe(true)
    expect(data.activity.every((row) => row.councilId === "phc")).toBe(true)
  })

  it("fails closed for unknown councils and ward filters", () => {
    expect(getLgaData("missing")).toEqual({
      premises: [],
      approvals: [],
      inspections: [],
      payments: [],
      activity: [],
    })
    expect(
      filterLgaRows(getLgaData("phc").payments, { ward: "missing" })
    ).toEqual([])
  })

  it("shows supplied decisions only after joining the submission to the council", () => {
    const decisions = {
      "HA-REV-001": {
        outcome: "approved" as const,
        decidedAt: "2026-10-01",
        certificateNumber: "HA-2026-001",
      },
      "HA-REV-002": {
        outcome: "denied" as const,
        decidedAt: "2026-10-02",
        reason: "Outstanding findings",
      },
    }
    const data = getLgaData("phc", { decisions })
    expect(data.approvals.find((row) => row.id === "HA-REV-001")).toMatchObject(
      {
        status: "Approved",
        certificateNumber: "HA-2026-001",
        decidedAt: "2026-10-01",
      }
    )
    expect(data.approvals.find((row) => row.id === "HA-REV-002")).toMatchObject(
      { status: "Denied", reason: "Outstanding findings" }
    )
    expect(getLgaData("obio", { decisions }).approvals).toEqual([])
  })

  it("provides a ledger for each existing council and derives consistent settlement totals", () => {
    for (const council of seedDatabase.councils) {
      const payments = getLgaData(council.id).payments
      expect(payments.length).toBeGreaterThan(0)
      const totals = financeTotals(payments)
      expect(totals.collections).toBe(totals.grossCollections - totals.refunds)
      expect(totals.pendingSettlement).toBe(totals.lgaShare - totals.paidOut)
      expect(
        payments.every(
          (row) =>
            row.paidOut <= row.lgaShare &&
            row.lgaShare <= row.amount - row.refunded
        )
      ).toBe(true)
    }
    const payment = getLgaData("phc").payments[0]
    expect(
      financeTotals([
        {
          ...payment,
          amount: 10000,
          refunded: 2000,
          lgaShare: 4000,
          paidOut: 1000,
        },
      ])
    ).toEqual({
      grossCollections: 10000,
      collections: 8000,
      refunds: 2000,
      lgaShare: 4000,
      paidOut: 1000,
      pendingSettlement: 3000,
    })
  })

  it("filters by service and inclusive calendar dates without mutating rows", () => {
    const rows = [
      { ward: "Town", service: "Fitness", date: "2026-09-22T23:59:59Z" },
      { ward: "Town", service: "Fitness", date: "2026-09-23" },
      { ward: "Town", service: "Fumigation", date: "2026-09-22" },
    ]
    expect(
      filterLgaRows(
        rows,
        {
          ward: "Town",
          service: "Fitness",
          from: "2026-09-22",
          to: "2026-09-22",
        },
        (row) => row.date
      )
    ).toEqual([rows[0]])
    expect(
      filterLgaRows(
        rows,
        { from: "2026-09-23", to: "2026-09-22" },
        (row) => row.date
      )
    ).toEqual([])
    expect(filterLgaRows(rows, { from: "2026-09-22" })).toEqual([])
    expect(rows).toHaveLength(3)
  })

  it("escapes CSV cells and neutralizes spreadsheet formulas including leading whitespace", () => {
    expect(
      createLgaCsv(
        ["Name", "Amount"],
        [
          ['A, "B"\nC', 1200],
          ["=SUM(A1)", " \t+CMD"],
          [null, undefined],
        ]
      )
    ).toBe(
      '"Name","Amount"\r\n"A, ""B""\nC","1200"\r\n"\'=SUM(A1)","\' \t+CMD"\r\n"",""'
    )
    for (const value of [
      "@SUM(A1)",
      "-CMD",
      "\tformula",
      "\rformula",
      "\nformula",
    ]) {
      expect(createLgaCsv([value], [])).toContain(`"'${value}"`)
    }
  })
})
