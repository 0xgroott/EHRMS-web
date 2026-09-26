import type { FumigationApplication, FumigationState } from "./fumigation-types"

const STORAGE_PREFIX = "ehrcms:fumigation:v1:"
const subscribers = new Map<string, Set<FumigationStoreListener>>()

export type FumigationStoreListener = (state: FumigationState) => void

export interface FumigationStore {
  read: (profileId: string) => FumigationState
  write: (profileId: string, state: FumigationState) => void
  subscribe: (
    profileId: string,
    listener: FumigationStoreListener
  ) => () => void
}

export function emptyFumigationState(): FumigationState {
  return { application: null }
}

export function fumigationStorageKey(profileId: string) {
  return `${STORAGE_PREFIX}${profileId}`
}

export function createFumigationStore(
  storage: Storage | null = browserStorage()
): FumigationStore {
  return {
    read(profileId) {
      if (!storage || !profileId) return emptyFumigationState()
      try {
        const value: unknown = JSON.parse(
          storage.getItem(fumigationStorageKey(profileId)) ?? "null"
        )
        return isFumigationState(value)
          ? structuredClone(value)
          : emptyFumigationState()
      } catch {
        return emptyFumigationState()
      }
    },
    write(profileId, state) {
      if (!storage || !profileId) return
      storage.setItem(fumigationStorageKey(profileId), JSON.stringify(state))
      subscribers
        .get(profileId)
        ?.forEach((listener) => listener(structuredClone(state)))
    },
    subscribe(profileId, listener) {
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

function isFumigationState(value: unknown): value is FumigationState {
  if (!value || typeof value !== "object" || !("application" in value))
    return false
  const state = value as FumigationState
  return (
    (state.application === null ||
      isFumigationApplication(state.application)) &&
    (state.history === undefined ||
      (Array.isArray(state.history) &&
        state.history.every(isFumigationApplication)))
  )
}

function isFumigationApplication(
  value: unknown
): value is FumigationApplication {
  if (!value || typeof value !== "object") return false
  const application = value as Partial<FumigationApplication>
  return (
    typeof application.id === "string" &&
    (application.premisesName === undefined ||
      typeof application.premisesName === "string") &&
    typeof application.requestedPeriod === "string" &&
    typeof application.declaration === "boolean" &&
    (application.certificate === undefined ||
      (typeof application.certificate.id === "string" &&
        typeof application.certificate.councilId === "string" &&
        (application.certificate.premisesSnapshot === undefined ||
          (typeof application.certificate.premisesSnapshot.businessName ===
            "string" &&
            typeof application.certificate.premisesSnapshot.premisesName ===
              "string" &&
            typeof application.certificate.premisesSnapshot.address ===
              "string")) &&
        typeof application.certificate.workDate === "string" &&
        Number.isFinite(Date.parse(application.certificate.issuedAt)) &&
        Number.isFinite(Date.parse(application.certificate.expiresAt)))) &&
    [
      "draft",
      "review",
      "awaiting-provider",
      "report-submitted",
      "eho-confirmed",
      "issued",
    ].includes(application.stage ?? "")
  )
}
