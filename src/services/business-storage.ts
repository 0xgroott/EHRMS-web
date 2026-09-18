import { emptyBusinessState } from "@/data/business-seeds"
import type {
  BusinessAlert,
  BusinessDocument,
  BusinessOnboardingStage,
  BusinessPortalState,
  BusinessPremisesInput,
  BusinessProfile,
} from "@/domain/business-types"

export const STORAGE_KEY = "ehrcms:business:v1"

const businessStages: BusinessOnboardingStage[] = [
  "account",
  "verification",
  "setup",
  "complete",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isStage(value: unknown): value is BusinessOnboardingStage {
  return (
    typeof value === "string" &&
    businessStages.includes(value as BusinessOnboardingStage)
  )
}

function isPremises(value: unknown): value is BusinessPremisesInput {
  if (!isRecord(value)) return false

  return (
    typeof value.premisesName === "string" &&
    typeof value.businessType === "string" &&
    (value.registrationNumber === undefined ||
      typeof value.registrationNumber === "string") &&
    typeof value.address === "string" &&
    typeof value.ward === "string" &&
    typeof value.councilId === "string"
  )
}

function isDocument(value: unknown): value is BusinessDocument {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.size === "number" &&
    typeof value.category === "string"
  )
}

function isAlert(value: unknown): value is BusinessAlert {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    (value.kind === "inspection" || value.kind === "corrective-action") &&
    typeof value.title === "string" &&
    typeof value.dueAt === "string" &&
    typeof value.urgent === "boolean" &&
    typeof value.href === "string"
  )
}

function isProfile(value: unknown): value is BusinessProfile {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.businessName === "string" &&
    typeof value.contactName === "string" &&
    typeof value.phone === "string" &&
    typeof value.email === "string" &&
    typeof value.acceptedTerms === "boolean" &&
    typeof value.verified === "boolean" &&
    Array.isArray(value.documents) &&
    value.documents.every(isDocument) &&
    (value.premises === undefined || isPremises(value.premises))
  )
}

function isBusinessPortalState(value: unknown): value is BusinessPortalState {
  if (!isRecord(value)) return false

  return (
    value.schemaVersion === 1 &&
    isStage(value.stage) &&
    Array.isArray(value.alerts) &&
    value.alerts.every(isAlert) &&
    (value.profile === null || isProfile(value.profile))
  )
}

export function createBusinessStorage(storage: Storage = window.localStorage) {
  return {
    read(): BusinessPortalState {
      try {
        const raw = storage.getItem(STORAGE_KEY)
        if (!raw) return structuredClone(emptyBusinessState)

        const value: unknown = JSON.parse(raw)
        return isBusinessPortalState(value)
          ? value
          : structuredClone(emptyBusinessState)
      } catch {
        return structuredClone(emptyBusinessState)
      }
    },
    write(state: BusinessPortalState) {
      storage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    reset() {
      storage.removeItem(STORAGE_KEY)
    },
  }
}
