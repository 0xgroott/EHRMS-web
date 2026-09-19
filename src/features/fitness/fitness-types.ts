export type FitnessStage =
  "draft" | "review" | "awaiting-facility" | "result-received" | "issued"

export interface FoodHandler {
  id: string
  fullName: string
  sex: string
  dateOfBirth: string
  role: string
  identityNumber: string
  phone: string
  premisesName: string
  consent: boolean
}

export interface FitnessFacility {
  id: string
  name: string
  location: string
  service: string
  contact: string
  priceNgn: number
}

export interface FitnessCertificate {
  id: string
  handlerIds: string[]
  councilId: string
  issuedAt: string
  expiresAt: string
}

export interface FitnessApplication {
  id: string
  handlerIds: string[]
  facilityId?: string
  stage: FitnessStage
  totalNgn?: number
  paymentReference?: string
  certificate?: FitnessCertificate
}

export interface FitnessState {
  handlers: FoodHandler[]
  application: FitnessApplication | null
}

export type FitnessRuleResult<T> =
  { ok: true; value: T } | { ok: false; error: string }

export interface HandlerReadiness {
  ready: boolean
  reasons: string[]
}

export type FoodHandlerInput = Omit<FoodHandler, "id">
