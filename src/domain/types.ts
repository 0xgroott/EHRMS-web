export type DemoRole =
  | "admin"
  | "super-admin"
  | "eho"
  | "moh-director"
  | "finance-officer"
  | "business-user"

export type ComplianceStatus =
  "Compliant" | "Pending" | "Non-compliant" | "Expiring soon" | "Suspended"

export type CertificateStatus =
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "At Risk"
  | "Suspended"
  | "Revoked"
  | "Withdrawn"
  | "Replaced"
  | "Pending"
  | "Not Found"

export type NavigationId =
  | "dashboard"
  | "applications"
  | "inspections"
  | "premises"
  | "certificates"
  | "providers"
  | "finance"
  | "notices"
  | "reports"
  | "users"
  | "settings"
  | "audit"
  | "system"

export interface Council {
  id: string
  name: string
  code: string
}

export interface CertificateSummary {
  id?: string
  type: "Health Approval" | "Fumigation" | "Fitness"
  status: CertificateStatus
  expiresAt?: string
}

export interface PremisesDocument {
  id: string
  name: string
  category: string
  addedAt: string
}

export interface PremisesPhotoSummary {
  id: string
  name: string
  dataUrl?: string
}

export interface PremisesProfileSummary {
  contactName: string
  premisesName: string
  registrationNumber: string
  links: {
    website?: string
    instagram?: string
    facebook?: string
    x?: string
  }
  photos: PremisesPhotoSummary[]
}

export interface InspectionSummary {
  id: string
  type: string
  status: string
  scheduledAt: string
  officer: string
}

export interface Premises {
  id: string
  businessName: string
  tradingName: string
  email?: string
  phone?: string
  kybVerified: boolean
  businessProfileId?: string
  profile: PremisesProfileSummary
  address: string
  ward: string
  councilId: string
  premisesType: string
  complianceStatus: ComplianceStatus
  certificates: CertificateSummary[]
  outstandingContraventions: number
  documents: PremisesDocument[]
  inspections: InspectionSummary[]
}

export interface WorkItem {
  id: string
  kind: "application" | "inspection" | "premises" | "certificate" | "payment"
  title: string
  description: string
  status: string
  councilId: string
  priority: "high" | "medium" | "normal"
  href: string
  permittedRoles: DemoRole[]
  updatedAt: string
}

export interface ActivityEvent {
  id: string
  title: string
  description: string
  occurredAt: string
  actor: string
  councilId: string
  href?: string
}

export interface PremisesFilters {
  q?: string
  councilId?: string
  ward?: string
  type?: string
  status?: ComplianceStatus
}

export interface DashboardFilters {
  q?: string
  councilId?: string
  status?: string
  type?: WorkItem["kind"]
}

export interface MockDatabase {
  schemaVersion: 4
  councils: Council[]
  premises: Premises[]
  workItems: WorkItem[]
  activity: ActivityEvent[]
}
