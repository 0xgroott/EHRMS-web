import type {
  FitnessApplication,
  FitnessState,
  FoodHandler,
} from "./fitness-types"

const STORAGE_PREFIX = "ehrcms:fitness:v1:"

export function emptyFitnessState(): FitnessState {
  return { handlers: [], application: null }
}

export function fitnessStorageKey(profileId: string) {
  return `${STORAGE_PREFIX}${profileId}`
}

export function createFitnessStore(storage: Storage | null = browserStorage()) {
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
      isFitnessApplication(candidate.application))
  )
}

function isFoodHandler(value: unknown): value is FoodHandler {
  if (!value || typeof value !== "object") return false
  const handler = value as Partial<FoodHandler>
  return (
    typeof handler.id === "string" &&
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
  return (
    typeof application.id === "string" &&
    Array.isArray(application.handlerIds) &&
    application.handlerIds.every((id) => typeof id === "string") &&
    [
      "draft",
      "review",
      "awaiting-facility",
      "result-received",
      "issued",
    ].includes(application.stage ?? "")
  )
}
