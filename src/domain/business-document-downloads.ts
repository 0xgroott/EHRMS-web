import type {
  BusinessProfile,
  CertificatePremisesSnapshot,
} from "./business-types"
import type {
  FitnessApplication,
  FoodHandler,
} from "@/features/fitness/fitness-types"
import type { FumigationApplication } from "@/features/fumigation/fumigation-types"
import type { InspectionCase } from "@/features/inspection/inspection-types"
import { seedDatabase } from "@/data/seeds"

type Row = { label: string; value: string }
type Section = { title: string; rows?: Row[]; lines?: string[] }

export type PrintableBusinessDocument = {
  title: string
  reference: string
  filename: string
  sections: Section[]
}

const recordCopyNotice =
  "Portal record copy. Confirm certificate or notice status with the issuing council. A payment reference alone does not confirm settlement."

function councilName(id: string) {
  return seedDatabase.councils.find((council) => council.id === id)?.name ?? id
}

function premisesRows(
  profile: BusinessProfile | null,
  name?: string,
  snapshot?: CertificatePremisesSnapshot
): Row[] {
  return [
    {
      label: "Business",
      value: snapshot?.businessName ?? profile?.businessName ?? "Not recorded",
    },
    {
      label: "Premises",
      value:
        snapshot?.premisesName ??
        name ??
        profile?.premises?.premisesName ??
        "Not recorded",
    },
    {
      label: "Address",
      value: snapshot?.address ?? profile?.premises?.address ?? "Not recorded",
    },
  ]
}

function date(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed)
}

function money(amount?: number) {
  if (amount === undefined) return "Not recorded"
  return `NGN ${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(amount)}`
}

function filename(kind: string, reference: string) {
  const safeReference = reference.replace(/[^a-zA-Z0-9_-]+/g, "-")
  return `${kind}-${safeReference || "record"}.html`
}

export function fitnessCertificateDocument(
  application: FitnessApplication,
  handlers: FoodHandler[],
  profile: BusinessProfile | null
): PrintableBusinessDocument | null {
  const certificate = application.certificate
  if (!certificate) return null
  const covered = (application.handlerSnapshots ?? handlers).filter((handler) =>
    certificate.handlerIds.includes(handler.id)
  )
  return {
    title: "Fitness Certificate",
    reference: certificate.id,
    filename: filename("fitness-certificate", certificate.id),
    sections: [
      {
        title: "Premises",
        rows: premisesRows(profile, undefined, certificate.premisesSnapshot),
      },
      {
        title: "Certificate details",
        rows: [
          { label: "Application", value: application.id },
          {
            label: "Issuing council",
            value: councilName(certificate.councilId),
          },
          { label: "Issued", value: date(certificate.issuedAt) },
          { label: "Expires", value: date(certificate.expiresAt) },
        ],
      },
      {
        title: `Covered food handlers (${certificate.handlerIds.length})`,
        lines: covered.length
          ? covered.map((handler) => `${handler.fullName} - ${handler.role}`)
          : certificate.handlerIds,
      },
    ],
  }
}

export function fumigationCertificateDocument(
  application: FumigationApplication,
  profile: BusinessProfile | null,
  providerName?: string
): PrintableBusinessDocument | null {
  const certificate = application.certificate
  if (!certificate) return null
  return {
    title: "Fumigation Certificate",
    reference: certificate.id,
    filename: filename("fumigation-certificate", certificate.id),
    sections: [
      {
        title: "Premises",
        rows: premisesRows(profile, undefined, certificate.premisesSnapshot),
      },
      {
        title: "Certificate details",
        rows: [
          { label: "Application", value: application.id },
          { label: "Licensed provider", value: providerName ?? "Not recorded" },
          {
            label: "Supervising council",
            value: councilName(certificate.councilId),
          },
          { label: "Work date", value: date(certificate.workDate) },
          { label: "Issued", value: date(certificate.issuedAt) },
          { label: "Expires", value: date(certificate.expiresAt) },
        ],
      },
    ],
  }
}

export function healthApprovalDocument(
  inspection: InspectionCase,
  profile: BusinessProfile | null
): PrintableBusinessDocument | null {
  const certificate = inspection.certificate
  if (!certificate || inspection.stage !== "approval-issued") return null
  return {
    title: "Health Approval Certificate",
    reference: certificate.id,
    filename: filename("health-approval", certificate.id),
    sections: [
      {
        title: "Premises",
        rows: premisesRows(profile, inspection.premisesName),
      },
      {
        title: "Certificate details",
        rows: [
          { label: "Inspection", value: inspection.id },
          {
            label: "Issuing council",
            value: councilName(certificate.councilId),
          },
          { label: "Issued", value: date(certificate.issuedAt) },
          { label: "Expires", value: date(certificate.expiresAt) },
        ],
      },
    ],
  }
}

export function paymentReceiptDocument(
  kind: "Fitness" | "Fumigation",
  application: FitnessApplication | FumigationApplication,
  profile: BusinessProfile | null
): PrintableBusinessDocument | null {
  if (!application.paymentReference) return null
  return {
    title: `${kind} payment receipt`,
    reference: application.paymentReference,
    filename: filename(
      `${kind.toLowerCase()}-payment-receipt`,
      application.paymentReference
    ),
    sections: [
      { title: "Premises", rows: premisesRows(profile) },
      {
        title: "Payment details",
        rows: [
          { label: "Application", value: application.id },
          { label: "Service", value: kind },
          { label: "Amount", value: money(application.totalNgn) },
          { label: "Payment reference", value: application.paymentReference },
        ],
      },
    ],
  }
}

export function inspectionNoticeDocument(
  inspection: InspectionCase,
  followUp = false
): PrintableBusinessDocument | null {
  const notice = followUp ? inspection.followUpNotice : inspection.notice
  if (!notice) return null
  return {
    title: followUp ? "Follow-up inspection notice" : "Inspection notice",
    reference: notice.reference,
    filename: filename(
      followUp ? "follow-up-notice" : "inspection-notice",
      notice.reference
    ),
    sections: [
      {
        title: "Inspection details",
        rows: [
          { label: "Inspection", value: inspection.id },
          { label: "Premises", value: inspection.premisesName },
          {
            label: "Issuing council",
            value: councilName(inspection.councilId),
          },
          { label: "Scheduled", value: date(notice.scheduledAt) },
        ],
      },
      {
        title: "Preparation",
        lines: [
          followUp
            ? "The follow-up will review recorded corrections against the original findings."
            : "Make the premises and relevant records available for inspection at the scheduled time.",
        ],
      },
    ],
  }
}

export function findingsNoticeDocument(
  inspection: InspectionCase
): PrintableBusinessDocument | null {
  if (!inspection.findings.length) return null
  const reference = `FINDINGS-${inspection.id}`
  return {
    title: "Inspection findings notice",
    reference,
    filename: filename("inspection-findings", reference),
    sections: [
      {
        title: "Inspection details",
        rows: [
          { label: "Inspection", value: inspection.id },
          { label: "Premises", value: inspection.premisesName },
          {
            label: "Issuing council",
            value: councilName(inspection.councilId),
          },
        ],
      },
      ...inspection.findings.map((finding) => ({
        title: finding.title,
        rows: [
          { label: "Required action", value: finding.action },
          { label: "Deadline", value: date(finding.deadline) },
        ],
      })),
    ],
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }
    return entities[character]
  })
}

export function renderBusinessDocument(document: PrintableBusinessDocument) {
  const sections = document.sections
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.title)}</h2>${
          section.rows?.length
            ? `<dl>${section.rows
                .map(
                  (row) =>
                    `<div><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`
                )
                .join("")}</dl>`
            : ""
        }${
          section.lines?.length
            ? `<ul>${section.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
            : ""
        }</section>`
    )
    .join("")
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(document.title)} - ${escapeHtml(document.reference)}</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#172235;max-width:760px;margin:0 auto;padding:48px 28px}header{border-bottom:3px solid #175c50;padding-bottom:24px}small{color:#526078}h1{font-size:30px;line-height:1.2;margin:10px 0}h2{font-size:18px;margin:0 0 16px}section{padding:24px 0;border-bottom:1px solid #d9e0e4;break-inside:avoid}dl{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:16px}dt{font-size:13px;color:#526078}dd{margin:4px 0 0;font-weight:600;overflow-wrap:anywhere}li{margin:6px 0;overflow-wrap:anywhere}.notice{padding:12px 16px;background:#fff4e5;border:1px solid #d8a65b;font-weight:600}footer{font-size:12px;color:#526078;margin-top:28px}@media print{body{padding:0;max-width:none}.notice{print-color-adjust:exact}}@media(max-width:540px){dl{grid-template-columns:1fr}}</style></head><body><header><small>EHRCMS | BUSINESS PORTAL</small><h1>${escapeHtml(document.title)}</h1><p>Reference: <strong>${escapeHtml(document.reference)}</strong></p><p class="notice">${escapeHtml(recordCopyNotice)}</p></header><main>${sections}</main><footer>Generated from the records shown in EHRCMS.</footer></body></html>`
}

export function downloadBusinessDocument(document: PrintableBusinessDocument) {
  const blob = new Blob([renderBusinessDocument(document)], {
    type: "text/html;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement("a")
  link.href = url
  link.download = document.filename
  window.document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
