export interface BusinessAccountInput {
  businessName: string
  contactName: string
  phone: string
  email: string
  password: string
  acceptedTerms: boolean
}

export interface BusinessPremisesInput {
  premisesName: string
  businessType: string
  registrationNumber?: string
  address: string
  ward: string
  councilId: string
}

export type BusinessProfileDetailsInput = Pick<
  BusinessProfile,
  "businessName" | "contactName"
> &
  Pick<
    BusinessPremisesInput,
    "premisesName" | "businessType" | "registrationNumber" | "address" | "ward"
  >

export interface BusinessDocument {
  id: string
  name: string
  size: number
  category: string
}

export interface BusinessProfile {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
  acceptedTerms: boolean
  verified: boolean
  premises?: BusinessPremisesInput
  documents: BusinessDocument[]
}

export type BusinessOnboardingStage =
  "account" | "verification" | "setup" | "complete"

export interface BusinessAlert {
  id: string
  kind: "inspection" | "corrective-action"
  title: string
  dueAt: string
  urgent: boolean
  href: string
}

export interface BusinessPortalState {
  schemaVersion: 1
  /** Expiry timestamp only; the demo code itself is never persisted. */
  verificationExpiresAt?: number
  stage: BusinessOnboardingStage
  profile: BusinessProfile | null
  alerts: BusinessAlert[]
}

export type ValidationErrors<T> = Partial<Record<keyof T | "code", string>>
