import type {
  FitnessApplication,
  FitnessState,
  FoodHandler,
} from "./fitness-types"

const STORAGE_PREFIX = "ehrcms:fitness:v1:"
const subscribers = new Map<string, Set<FitnessStoreListener>>()

export type FitnessStoreListener = (state: FitnessState) => void

export interface FitnessStore {
  read: (profileId: string) => FitnessState
  write: (profileId: string, state: FitnessState) => void
  subscribe: (profileId: string, listener: FitnessStoreListener) => () => void
}

export function emptyFitnessState(): FitnessState {
  return { handlers: [], application: null }
}

export function fitnessStorageKey(profileId: string) {
  return `${STORAGE_PREFIX}${profileId}`
}

export function createFitnessStore(
  storage: Storage | null = browserStorage()
): FitnessStore {
  return {
    read(profileId: string): FitnessState {
      if (!storage || !profileId) return emptyFitnessState()
      try {
        const value: unknown = JSON.parse(
          storage.getItem(fitnessStorageKey(profileId)) ?? "null"
        )
        return isFitnessState(value)
          ? structuredClone(value)
          : emptyFitnessState()
      } catch {
        return emptyFitnessState()
      }
    },
    write(profileId: string, state: FitnessState) {
      if (!storage || !profileId) return
      storage.setItem(fitnessStorageKey(profileId), JSON.stringify(state))
      subscribers.get(profileId)?.forEach((listener) => {
        listener(structuredClone(state))
      })
    },
    subscribe(profileId: string, listener: FitnessStoreListener) {
      if (!profileId) return () => undefined
      const profileSubscribers = subscribers.get(profileId) ?? new Set()
      profileSubscribers.add(listener)
      subscribers.set(profileId, profileSubscribers)
      return () => {
        profileSubscribers.delete(listener)
        if (profileSubscribers.size === 0) subscribers.delete(profileId)
      }
    },
  }
}

function browserStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage
}

function isFitnessState(value: unknown): value is FitnessState {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<FitnessState>
  return (
    Array.isArray(candidate.handlers) &&
    candidate.handlers.every(isFoodHandler) &&
    (candidate.application === null ||
      isFitnessApplication(candidate.application)) &&
    (candidate.history === undefined ||
      (Array.isArray(candidate.history) &&
        candidate.history.every(isFitnessApplication)))
  )
}

function isFoodHandler(value: unknown): value is FoodHandler {
  if (!value || typeof value !== "object") return false
  const handler = value as Partial<FoodHandler>
  return (
    typeof handler.id === "string" &&
    (handler.archivedAt === undefined ||
      (typeof handler.archivedAt === "string" &&
        Number.isFinite(Date.parse(handler.archivedAt)))) &&
    typeof handler.fullName === "string" &&
    typeof handler.sex === "string" &&
    typeof handler.dateOfBirth === "string" &&
    typeof handler.role === "string" &&
    typeof handler.identityNumber === "string" &&
    typeof handler.phone === "string" &&
    typeof handler.premisesName === "string" &&
    typeof handler.consent === "boolean"
  )
}

function isFitnessApplication(value: unknown): value is FitnessApplication {
  if (!value || typeof value !== "object") return false
  const application = value as Partial<FitnessApplication>
  const purpose: unknown = (value as { purpose?: unknown }).purpose
  return (
    typeof application.id === "string" &&
    (purpose === undefined || purpose === "new-staff") &&
    Array.isArray(application.handlerIds) &&
    application.handlerIds.every((id) => typeof id === "string") &&
    (application.handlerSnapshots === undefined ||
      (Array.isArray(application.handlerSnapshots) &&
        application.handlerSnapshots.every(isFoodHandler))) &&
    (application.certificate === undefined ||
      (typeof application.certificate.id === "string" &&
        Array.isArray(application.certificate.handlerIds) &&
        application.certificate.handlerIds.every(
          (id) => typeof id === "string"
        ) &&
        typeof application.certificate.councilId === "string" &&
        (application.certificate.premisesSnapshot === undefined ||
          (typeof application.certificate.premisesSnapshot.businessName ===
            "string" &&
            typeof application.certificate.premisesSnapshot.premisesName ===
              "string" &&
            typeof application.certificate.premisesSnapshot.address ===
              "string")) &&
        Number.isFinite(Date.parse(application.certificate.issuedAt)) &&
        Number.isFinite(Date.parse(application.certificate.expiresAt)))) &&
    [
      "draft",
      "review",
      "awaiting-facility",
      "result-received",
      "issued",
    ].includes(application.stage ?? "")
  )
}
