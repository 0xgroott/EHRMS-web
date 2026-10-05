import { seedDatabase } from "@/data/seeds"
import { mohSubmissions } from "@/features/moh/moh-approvals"
import type {
  HealthApprovalDecision,
  MohSubmission,
} from "@/features/moh/moh-approvals"
import type {
  ActivityEvent,
  InspectionSummary,
  MockDatabase,
  Premises,
} from "@/domain/types"
import { lgaPaymentRecords } from "./lga-finance-data"
import type { LgaPaymentRecord } from "./lga-finance-data"

export interface LgaApproval {
  id: string
  premisesId: string
  businessName: string
  ward: string
  date: string
  reference: string
  officer: string
  status: "Awaiting decision" | "Approved" | "Denied"
  decidedAt?: string
  certificateNumber?: string
  reason?: string
}

export interface LgaInspection extends InspectionSummary {
  premisesId: string
  businessName: string
  ward: string
  /** Premises-level open findings, not a per-inspection finding count. */
  outstandingContraventions: number
}

export interface LgaPayment extends LgaPaymentRecord {
  businessName: string
  ward: string
}

export interface LgaDataSources {
  database?: MockDatabase
  submissions?: MohSubmission[]
  payments?: LgaPaymentRecord[]
  decisions?: Record<string, HealthApprovalDecision>
}

export interface LgaData {
  premises: Premises[]
  approvals: LgaApproval[]
  inspections: LgaInspection[]
  payments: LgaPayment[]
  activity: ActivityEvent[]
}

/** Frontend fixture selection only; production requires backend authorization. */
export function getLgaData(
  councilId: string,
  sources: LgaDataSources = {}
): LgaData {
  const database = sources.database ?? seedDatabase
  if (!database.councils.some((council) => council.id === councilId)) {
    return {
      premises: [],
      approvals: [],
      inspections: [],
      payments: [],
      activity: [],
    }
  }
  const premises = database.premises.filter(
    (row) => row.councilId === councilId
  )
  const byId = new Map(premises.map((row) => [row.id, row]))
  const approvals = (
    sources.submissions ?? mohSubmissions
  ).flatMap<LgaApproval>((submission) => {
    const record = byId.get(submission.premisesId)
    if (!record) return []
    const decision = sources.decisions?.[submission.id]
    return [
      {
        id: submission.id,
        premisesId: record.id,
        businessName: record.businessName,
        ward: record.ward,
        date: submission.inspection.completedAt,
        reference: submission.inspection.reference,
        officer: submission.inspection.officer,
        status:
          decision?.outcome === "approved"
            ? "Approved"
            : decision?.outcome === "denied"
              ? "Denied"
              : "Awaiting decision",
        ...(decision ? { decidedAt: decision.decidedAt } : {}),
        ...(decision?.outcome === "approved"
          ? { certificateNumber: decision.certificateNumber }
          : {}),
        ...(decision?.outcome === "denied" ? { reason: decision.reason } : {}),
      },
    ]
  })
  const inspections = premises.flatMap((record) =>
    record.inspections.map((inspection) => ({
      ...inspection,
      premisesId: record.id,
      businessName: record.businessName,
      ward: record.ward,
      outstandingContraventions: record.outstandingContraventions,
    }))
  )
  const payments = (sources.payments ?? lgaPaymentRecords).flatMap(
    (payment) => {
      const record = byId.get(payment.premisesId)
      return record
        ? [{ ...payment, businessName: record.businessName, ward: record.ward }]
        : []
    }
  )
  return {
    premises,
    approvals,
    inspections,
    payments,
    activity: database.activity.filter((row) => row.councilId === councilId),
  }
}

export interface LgaFilters {
  ward?: string
  from?: string
  to?: string
  service?: string
}

export function filterLgaRows<T extends { ward: string; service?: string }>(
  rows: T[],
  filters: LgaFilters,
  getDate?: (row: T) => string
): T[] {
  return rows.filter((row) => {
    if (filters.ward && row.ward !== filters.ward) return false
    if (filters.service && row.service !== filters.service) return false
    if (filters.from || filters.to) {
      const day = getDate?.(row).slice(0, 10)
      if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false
      if (filters.from && day < filters.from) return false
      if (filters.to && day > filters.to) return false
    }
    return true
  })
}

export function financeTotals(payments: LgaPayment[]) {
  return payments.reduce(
    (totals, payment) => ({
      grossCollections: totals.grossCollections + payment.amount,
      collections: totals.collections + payment.amount - payment.refunded,
      refunds: totals.refunds + payment.refunded,
      lgaShare: totals.lgaShare + payment.lgaShare,
      paidOut: totals.paidOut + payment.paidOut,
      pendingSettlement:
        totals.pendingSettlement + payment.lgaShare - payment.paidOut,
    }),
    {
      grossCollections: 0,
      collections: 0,
      refunds: 0,
      lgaShare: 0,
      paidOut: 0,
      pendingSettlement: 0,
    }
  )
}

export function createLgaCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
): string {
  const cell = (value: string | number | null | undefined) => {
    let text = String(value ?? "")
    if (/^[\t\r\n]|^\s*[=+@-]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")
}
