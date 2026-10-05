import { expect, test } from "vitest"
import { seedDatabase } from "@/data/seeds"
import { getLgaData } from "./lga-data"
import { healthApprovalStatus } from "./lga-health-approval"

test("distinguishes applications from certificate status and no application", () => {
  const premises = seedDatabase.premises[0]
  const data = getLgaData(premises.councilId)
  expect(healthApprovalStatus(premises, data.approvals, "2026-10-05")).toBe(
    "Awaiting decision"
  )
  expect(
    healthApprovalStatus({ ...premises, certificates: [] }, [], "2026-10-05")
  ).toBe("Not applied")
  expect(
    healthApprovalStatus(
      {
        ...premises,
        certificates: [
          {
            type: "Health Approval",
            status: "Active",
            expiresAt: "2026-10-01",
          },
        ],
      },
      [],
      "2026-10-05"
    )
  ).toBe("Expired")
  expect(
    healthApprovalStatus(
      {
        ...premises,
        certificates: [{ type: "Health Approval", status: "Suspended" }],
      },
      [],
      "2026-10-05"
    )
  ).toBe("Suspended")
  expect(
    healthApprovalStatus(
      {
        ...premises,
        certificates: [
          {
            type: "Health Approval",
            status: "Active",
            expiresAt: "2026-12-31",
          },
        ],
      },
      [],
      "2026-10-05"
    )
  ).toBe("Approved")
  expect(
    healthApprovalStatus(
      premises,
      data.approvals.map((item) => ({ ...item, status: "Denied" })),
      "2026-10-05"
    )
  ).toBe("Denied")
})
