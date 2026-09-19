import { describe, expect, it } from "vitest"
import { LICENSED_FUMIGATION_PROVIDERS } from "./fumigation-seeds"
import {
  beginFumigationApplication,
  chooseLicensedProvider,
  confirmFumigationPayment,
  confirmEho,
  issueFumigationCertificate,
  recordProviderReport,
} from "./fumigation-rules"

const provider = LICENSED_FUMIGATION_PROVIDERS[0]

describe("fumigation rules", () => {
  it("requires a period and declaration before starting", () => {
    expect(beginFumigationApplication("  ", true)).toEqual({
      ok: false,
      error: "Enter the requested fumigation period",
    })
    expect(beginFumigationApplication("September 2026", false)).toEqual({
      ok: false,
      error: "Confirm the premises declaration",
    })
  })

  it("selects a licensed provider and preserves its service price", () => {
    const started = beginFumigationApplication(" September 2026 ", true)
    if (!started.ok) throw new Error(started.error)
    const selected = chooseLicensedProvider(started.value, provider)
    expect(selected).toMatchObject({
      ok: true,
      value: {
        requestedPeriod: "September 2026",
        declaration: true,
        providerId: provider.id,
        totalNgn: provider.priceNgn,
        stage: "review",
      },
    })
  })

  it("blocks provider selection before the declaration", () => {
    const application = {
      id: "fumigation-application-1",
      requestedPeriod: "September 2026",
      declaration: false,
      stage: "draft" as const,
    }
    expect(chooseLicensedProvider(application, provider)).toEqual({
      ok: false,
      error: "Complete the period and premises declaration first",
    })
  })

  it("keeps provider, EHO, and council transitions in order", () => {
    const started = beginFumigationApplication("September 2026", true)
    if (!started.ok) throw new Error(started.error)
    const selected = chooseLicensedProvider(started.value, provider)
    if (!selected.ok) throw new Error(selected.error)
    expect(recordProviderReport(selected.value)).toMatchObject({ ok: false })

    const paid = confirmFumigationPayment(selected.value)
    if (!paid.ok) throw new Error(paid.error)
    expect(paid.value).toMatchObject({
      stage: "awaiting-provider",
      paymentReference: expect.any(String),
    })
    expect(confirmEho(paid.value)).toMatchObject({ ok: false })
    const reported = recordProviderReport(paid.value, "2026-09-20")
    if (!reported.ok) throw new Error(reported.error)
    expect(reported.value).toMatchObject({
      stage: "report-submitted",
      workDate: "2026-09-20",
    })
    const confirmed = confirmEho(reported.value)
    if (!confirmed.ok) throw new Error(confirmed.error)
    const issued = issueFumigationCertificate(confirmed.value, "phc", {
      issuedAt: "2026-09-21T09:00:00.000Z",
      expiresAt: "2027-09-21T09:00:00.000Z",
    })
    expect(issued).toMatchObject({
      ok: true,
      value: {
        stage: "issued",
        certificate: {
          id: expect.any(String),
          councilId: "phc",
          workDate: "2026-09-20",
        },
      },
    })
  })

  it("does not replace an application after payment", () => {
    const paid = {
      id: "fumigation-application-1",
      requestedPeriod: "September 2026",
      declaration: true,
      providerId: provider.id,
      totalNgn: provider.priceNgn,
      stage: "awaiting-provider" as const,
      paymentReference: "FUM-PAY-1",
    }
    expect(beginFumigationApplication("October 2026", true, paid)).toEqual({
      ok: false,
      error: "The application can only be changed before payment",
    })
    expect(issueFumigationCertificate(paid, "phc")).toMatchObject({
      ok: false,
    })
  })
})
