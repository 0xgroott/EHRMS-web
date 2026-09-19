export interface BusinessMediaItem {
  name: string
  dataUrl: string
}

export interface BusinessMediaState {
  avatar: BusinessMediaItem | null
  photos: [
    BusinessMediaItem | null,
    BusinessMediaItem | null,
    BusinessMediaItem | null,
  ]
}

const storagePrefix = "ehrcms:business-media:v1:"

export function emptyBusinessMedia(): BusinessMediaState {
  return { avatar: null, photos: [null, null, null] }
}

export function businessMediaStorageKey(profileId: string): string {
  return `${storagePrefix}${profileId}`
}

function isMediaItem(value: unknown): value is BusinessMediaItem {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<BusinessMediaItem>
  return (
    typeof item.name === "string" &&
    typeof item.dataUrl === "string" &&
    item.dataUrl.startsWith("data:image/webp;base64,")
  )
}

function isMediaState(value: unknown): value is BusinessMediaState {
  if (!value || typeof value !== "object") return false
  const state = value as Record<string, unknown>
  return (
    (state.avatar === null || isMediaItem(state.avatar)) &&
    Array.isArray(state.photos) &&
    state.photos.length === 3 &&
    state.photos.every((item: unknown) => item === null || isMediaItem(item))
  )
}

export function createBusinessMediaStore(
  storage: Storage | null = typeof window === "undefined"
    ? null
    : window.localStorage
) {
  return {
    read(profileId: string): BusinessMediaState {
      if (!storage || !profileId) return emptyBusinessMedia()
      try {
        const raw = storage.getItem(businessMediaStorageKey(profileId))
        if (!raw) return emptyBusinessMedia()
        const parsed: unknown = JSON.parse(raw)
        return isMediaState(parsed) ? parsed : emptyBusinessMedia()
      } catch {
        return emptyBusinessMedia()
      }
    },
    write(profileId: string, state: BusinessMediaState): void {
      if (!storage || !profileId)
        throw new Error("Business media is unavailable")
      storage.setItem(businessMediaStorageKey(profileId), JSON.stringify(state))
    },
  }
}
