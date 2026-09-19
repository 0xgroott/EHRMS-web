import { describe, expect, it } from "vitest"
import type { FitnessApplication, FoodHandler } from "./fitness-types"
import {
  beginApplication,
  confirmDemoPayment,
  handlerReadiness,
  issueDemoCertificate,
  recordFitResult,
} from "./fitness-rules"

const handler: FoodHandler = {
  id: "handler-ada",
  fullName: "Ada Okafor",
  sex: "Female",
  dateOfBirth: "1991-04-12",
  role: "Kitchen assistant",
  identityNumber: "NIN-12345678901",
  phone: "08030000000",
  premisesName: "Riverside Kitchen & Foods",
  consent: true,
}

const awaitingFacility: FitnessApplication = {
  id: "fitness-application-1",
  handlerIds: [handler.id],
  facilityId: "facility-1",
  stage: "awaiting-facility",
  totalNgn: 12500,
  paymentReference: "DEMO-FITNESS-1",
}

describe("fitness rules", () => {
  it("marks a complete handler as eligible", () => {
    expect(handlerReadiness(handler)).toEqual({ ready: true, reasons: [] })
  })

  it("blocks a handler without recorded consent", () => {
    expect(handlerReadiness({ ...handler, consent: false })).toEqual({
      ready: false,
      reasons: ["Record the handler's consent"],
    })
  })

  it("rejects starting an application with no selected handlers", () => {
    expect(beginApplication([handler], [])).toEqual({
      ok: false,
      error: "Select at least one eligible food handler",
    })
  })

  it("rejects payment before the application is ready for review", () => {
    const result = beginApplication([handler], [handler.id])
    if (!result.ok) throw new Error(result.error)

    expect(confirmDemoPayment(result.value)).toEqual({
      ok: false,
      error: "Choose an approved facility before demo payment",
    })
  })

  it("keeps simulated facility and council transitions separate", () => {
    const result = recordFitResult(awaitingFacility)
    expect(result).toMatchObject({
      ok: true,
      value: { stage: "result-received" },
    })
    if (!result.ok) throw new Error(result.error)

    const issued = issueDemoCertificate(result.value, "lagos-mainland", {
      issuedAt: "2026-09-19T09:00:00.000Z",
      expiresAt: "2027-09-19T09:00:00.000Z",
    })
    expect(issued).toMatchObject({
      ok: true,
      value: {
        stage: "issued",
        certificate: {
          councilId: "lagos-mainland",
          handlerIds: [handler.id],
          issuedAt: "2026-09-19T09:00:00.000Z",
        },
      },
    })
  })
})
