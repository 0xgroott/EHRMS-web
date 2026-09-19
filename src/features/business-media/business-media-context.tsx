import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useBusinessSession } from "@/app/business-session"
import { prepareBusinessImage } from "./business-media-rules"
import {
  createBusinessMediaStore,
  emptyBusinessMedia,
} from "./business-media-store"
import type { BusinessMediaState } from "./business-media-store"

type MediaResult = { ok: true } | { ok: false; error: string }

interface BusinessMediaContextValue {
  media: BusinessMediaState
  isHydrated: boolean
  uploadAvatar: (file: File) => Promise<MediaResult>
  removeAvatar: () => MediaResult
  uploadPhoto: (slot: number, file: File) => Promise<MediaResult>
  removePhoto: (slot: number) => MediaResult
}

const BusinessMediaContext = createContext<BusinessMediaContextValue | null>(
  null
)

function errorResult(error: unknown): MediaResult {
  return {
    ok: false,
    error:
      error instanceof Error && error.message
        ? error.message
        : "The image could not be saved. Please try again.",
  }
}

export function BusinessMediaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { state: business, isHydrated: businessHydrated } = useBusinessSession()
  const profileId = business.profile?.id ?? null
  const store = useMemo(() => createBusinessMediaStore(), [])
  const [media, setMedia] = useState<BusinessMediaState>(emptyBusinessMedia)
  const mediaRef = useRef(media)
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null)
  const isHydrated = businessHydrated && loadedProfileId === profileId

  useEffect(() => {
    if (!businessHydrated) return
    const next = profileId ? store.read(profileId) : emptyBusinessMedia()
    mediaRef.current = next
    setMedia(next)
    setLoadedProfileId(profileId)
  }, [businessHydrated, profileId, store])

  const save = useCallback(
    (next: BusinessMediaState): MediaResult => {
      if (!profileId)
        return { ok: false, error: "A business profile is required." }
      try {
        store.write(profileId, next)
        mediaRef.current = next
        setMedia(next)
        return { ok: true }
      } catch {
        return {
          ok: false,
          error:
            "The image could not be saved in this browser. Try a smaller image.",
        }
      }
    },
    [profileId, store]
  )

  const uploadAvatar = useCallback(
    async (file: File): Promise<MediaResult> => {
      try {
        const dataUrl = await prepareBusinessImage(file, "avatar")
        return save({
          ...mediaRef.current,
          avatar: { name: file.name, dataUrl },
        })
      } catch (error) {
        return errorResult(error)
      }
    },
    [save]
  )

  const removeAvatar = useCallback(
    () => save({ ...mediaRef.current, avatar: null }),
    [save]
  )

  const uploadPhoto = useCallback(
    async (slot: number, file: File): Promise<MediaResult> => {
      if (!Number.isInteger(slot) || slot < 0 || slot > 2)
        return { ok: false, error: "Choose one of the three photo slots." }
      try {
        const dataUrl = await prepareBusinessImage(file, "photo")
        const photos = [
          ...mediaRef.current.photos,
        ] as BusinessMediaState["photos"]
        photos[slot] = { name: file.name, dataUrl }
        return save({ ...mediaRef.current, photos })
      } catch (error) {
        return errorResult(error)
      }
    },
    [save]
  )

  const removePhoto = useCallback(
    (slot: number): MediaResult => {
      if (!Number.isInteger(slot) || slot < 0 || slot > 2)
        return { ok: false, error: "Choose one of the three photo slots." }
      const photos = [
        ...mediaRef.current.photos,
      ] as BusinessMediaState["photos"]
      photos[slot] = null
      return save({ ...mediaRef.current, photos })
    },
    [save]
  )

  const value = useMemo(
    () => ({
      media: isHydrated ? media : emptyBusinessMedia(),
      isHydrated,
      uploadAvatar,
      removeAvatar,
      uploadPhoto,
      removePhoto,
    }),
    [isHydrated, media, uploadAvatar, removeAvatar, uploadPhoto, removePhoto]
  )

  return (
    <BusinessMediaContext.Provider value={value}>
      {children}
    </BusinessMediaContext.Provider>
  )
}

export function useBusinessMedia() {
  const value = useContext(BusinessMediaContext)
  if (!value)
    throw new Error(
      "useBusinessMedia must be used within BusinessMediaProvider"
    )
  return value
}
