import type { InspectionCase, InspectionState } from "./inspection-types"

const STORAGE_PREFIX = "ehrcms:inspection:v1:"
const subscribers = new Map<string, Set<InspectionStoreListener>>()

export type InspectionStoreListener = (state: InspectionState) => void

export interface InspectionStore {
  read: (profileId: string) => InspectionState
  write: (profileId: string, state: InspectionState) => void
  subscribe: (
    profileId: string,
    listener: InspectionStoreListener
  ) => () => void
}

export function emptyInspectionState(): InspectionState {
  return { inspection: null }
}

export function inspectionStorageKey(profileId: string): string {
  return `${STORAGE_PREFIX}${profileId}`
}

export function createInspectionStore(
  storage: Storage | null = typeof window === "undefined"
    ? null
    : window.localStorage
): InspectionStore {
  return {
    read(profileId) {
      if (!storage || !profileId) return emptyInspectionState()
      try {
        const value: unknown = JSON.parse(
          storage.getItem(inspectionStorageKey(profileId)) ?? "null"
        )
        return isInspectionState(value)
          ? structuredClone(value)
          : emptyInspectionState()
      } catch {
        return emptyInspectionState()
      }
    },
    write(profileId, state) {
      if (!storage || !profileId) return
      storage.setItem(inspectionStorageKey(profileId), JSON.stringify(state))
      subscribers
        .get(profileId)
        ?.forEach((listener) => listener(structuredClone(state)))
    },
    subscribe(profileId, listener) {
      if (!profileId) return () => undefined
      const profileSubscribers =
        subscribers.get(profileId) ?? new Set<InspectionStoreListener>()
      profileSubscribers.add(listener)
      subscribers.set(profileId, profileSubscribers)
      return () => {
        profileSubscribers.delete(listener)
        if (profileSubscribers.size === 0) subscribers.delete(profileId)
      }
    },
  }
}

function isInspectionState(value: unknown): value is InspectionState {
  if (!value || typeof value !== "object" || !("inspection" in value))
    return false
  const state = value as InspectionState
  return state.inspection === null || isInspectionCase(state.inspection)
}

function isInspectionCase(value: unknown): value is InspectionCase {
  if (!value || typeof value !== "object") return false
  const inspection = value as Partial<InspectionCase>
  const notice = inspection.notice
  return (
    typeof inspection.id === "string" &&
    typeof inspection.councilId === "string" &&
    typeof inspection.premisesName === "string" &&
    [
      "notice-served",
      "notice-acknowledged",
      "findings-issued",
      "corrections-recorded",
      "follow-up-served",
      "follow-up-acknowledged",
      "resolved",
      "approval-issued",
      "further-action",
    ].includes(inspection.stage ?? "") &&
    !!notice &&
    typeof notice.reference === "string" &&
    typeof notice.scheduledAt === "string" &&
    Array.isArray(inspection.findings) &&
    inspection.findings.every(
      (finding) =>
        typeof finding.id === "string" &&
        typeof finding.title === "string" &&
        typeof finding.action === "string" &&
        typeof finding.deadline === "string"
    ) &&
    (!inspection.followUpNotice ||
      (typeof inspection.followUpNotice.reference === "string" &&
        typeof inspection.followUpNotice.scheduledAt === "string")) &&
    (!inspection.certificate ||
      (typeof inspection.certificate.id === "string" &&
        typeof inspection.certificate.councilId === "string" &&
        typeof inspection.certificate.issuedAt === "string" &&
        typeof inspection.certificate.expiresAt === "string"))
  )
}
