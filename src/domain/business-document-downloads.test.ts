import { afterEach, expect, it, vi } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import {
  downloadBusinessDocument,
  findingsNoticeDocument,
  fitnessCertificateDocument,
  inspectionNoticeDocument,
  paymentReceiptDocument,
  renderBusinessDocument,
} from "./business-document-downloads"

afterEach(() => vi.restoreAllMocks())

it("renders an archived certificate with its saved handler names and escaped content", () => {
  const document = fitnessCertificateDocument(
    {
      id: "fitness-application-1",
      handlerIds: ["handler-1"],
      stage: "issued",
      handlerSnapshots: [
        {
          id: "handler-1",
          fullName: "Ada <Okafor>",
          sex: "female",
          dateOfBirth: "1990-01-01",
          role: "Cook",
          identityNumber: "ID-1",
          phone: "08000000000",
          premisesName: "Riverside Kitchen",
          consent: true,
        },
      ],
      certificate: {
        id: "FIT-CERT-1",
        handlerIds: ["handler-1"],
        councilId: "phc",
        issuedAt: "2026-09-19",
        expiresAt: "2027-09-19",
        premisesSnapshot: {
          businessName: "Original business",
          premisesName: "Original premises",
          address: "Original address",
        },
      },
    },
    [],
    returningBusinessState.profile
  )
  expect(document?.filename).toBe("fitness-certificate-FIT-CERT-1.html")
  const html = renderBusinessDocument(document!)
  expect(html).toContain("Ada &lt;Okafor&gt; - Cook")
  expect(html).toContain("FIT-CERT-1")
  expect(html).toContain("Original premises")
  expect(html).not.toContain("Riverside Kitchen &amp; Foods")
  expect(html).toContain("Portal record copy")
  expect(html).not.toContain("Ada <Okafor>")
})

it("only offers payment records for confirmed references and retains application IDs", () => {
  expect(
    paymentReceiptDocument(
      "Fitness",
      { id: "fitness-application-1", handlerIds: [], stage: "draft" },
      returningBusinessState.profile
    )
  ).toBeNull()
  const document = paymentReceiptDocument(
    "Fumigation",
    {
      id: "fumigation-application-1",
      requestedPeriod: "2026-09",
      declaration: true,
      stage: "issued",
      totalNgn: 45000,
      paymentReference: "FUM-PAY-1",
    },
    returningBusinessState.profile
  )
  const html = renderBusinessDocument(document!)
  expect(html).toContain("fumigation-application-1")
  expect(html).toContain("NGN 45,000")
  expect(html).toContain("FUM-PAY-1")
  expect(html).toContain("payment reference alone does not confirm settlement")
})

it("keeps served notice and finding content separate from later acknowledgements and corrections", () => {
  const inspection = {
    id: "inspection-1",
    councilId: "phc",
    premisesName: "Riverside Kitchen",
    stage: "corrections-recorded" as const,
    notice: {
      reference: "INS-NOTICE-1",
      scheduledAt: "2026-09-28T10:00:00Z",
      acknowledgedAt: "2026-09-19T10:00:00Z",
    },
    findings: [
      {
        id: "finding-1",
        title: "Waste handling",
        action: "Provide covered bins.",
        deadline: "2026-10-05",
        correctionNote: "New bins installed.",
      },
    ],
  }
  const notice = renderBusinessDocument(inspectionNoticeDocument(inspection)!)
  const findings = renderBusinessDocument(findingsNoticeDocument(inspection)!)
  expect(notice).toContain("INS-NOTICE-1")
  expect(notice).not.toContain("Acknowledged")
  expect(findings).toContain("Provide covered bins.")
  expect(findings).not.toContain("New bins installed.")
})

it("downloads a self-contained HTML file with the expected name", () => {
  const createObjectURL = vi.fn(() => "blob:business-document")
  const revokeObjectURL = vi.fn()
  Object.assign(URL, { createObjectURL, revokeObjectURL })
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {})
  const document = paymentReceiptDocument(
    "Fitness",
    {
      id: "fitness-application-1",
      handlerIds: [],
      stage: "issued",
      paymentReference: "FIT-PAY-1",
    },
    returningBusinessState.profile
  )!
  downloadBusinessDocument(document)
  expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
  expect(click).toHaveBeenCalledOnce()
  expect(document.filename).toBe("fitness-payment-FIT-PAY-1.html")
  expect(window.document.querySelector("a[download]")).toBeNull()
})
