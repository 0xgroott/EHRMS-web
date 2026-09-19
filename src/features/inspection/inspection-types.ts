export type InspectionStage =
  | "notice-served"
  | "notice-acknowledged"
  | "findings-issued"
  | "corrections-recorded"
  | "follow-up-served"
  | "follow-up-acknowledged"
  | "resolved"
  | "approval-issued"
  | "further-action"

export interface InspectionNotice {
  reference: string
  scheduledAt: string
  acknowledgedAt?: string
}

export interface InspectionFinding {
  id: string
  title: string
  action: string
  deadline: string
  correctionNote?: string
}

export interface HealthApprovalCertificate {
  id: string
  councilId: string
  issuedAt: string
  expiresAt: string
}

export interface InspectionCase {
  id: string
  councilId: string
  premisesName: string
  stage: InspectionStage
  notice: InspectionNotice
  findings: InspectionFinding[]
  followUpNotice?: InspectionNotice
  certificate?: HealthApprovalCertificate
}

export interface InspectionState {
  inspection: InspectionCase | null
}

export type InspectionRuleResult<T> =
  { ok: true; value: T } | { ok: false; error: string }
