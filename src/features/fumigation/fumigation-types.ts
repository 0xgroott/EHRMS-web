export type FumigationStage =
  | "draft"
  | "review"
  | "awaiting-provider"
  | "report-submitted"
  | "eho-confirmed"
  | "issued"

export interface LicensedFumigationProvider {
  id: string
  name: string
  registrationNumber: string
  location: string
  service: string
  contact: string
  priceNgn: number
}

export interface FumigationCertificate {
  id: string
  councilId: string
  issuedAt: string
  expiresAt: string
  workDate: string
}

export interface FumigationApplication {
  id: string
  requestedPeriod: string
  declaration: boolean
  stage: FumigationStage
  providerId?: string
  totalNgn?: number
  paymentReference?: string
  workDate?: string
  certificate?: FumigationCertificate
}

export interface FumigationState {
  application: FumigationApplication | null
}

export type FumigationRuleResult<T> =
  { ok: true; value: T } | { ok: false; error: string }
