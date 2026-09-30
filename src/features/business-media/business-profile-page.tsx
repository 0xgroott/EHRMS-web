import { useRef, useState } from "react"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { seedDatabase } from "@/data/seeds"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notifySuccess } from "@/components/ui/app-toast"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessMedia } from "./business-media-context"
import type { BusinessMediaItem } from "./business-media-store"
import { BusinessProfileForm } from "./business-profile-form"

const acceptedImages = "image/png,image/jpeg,image/webp"
const photoLabels = ["Premises photo 1", "Premises photo 2", "Premises photo 3"]

function PhotoSlot({
  index,
  item,
  busy,
  onUpload,
  onRemove,
}: {
  index: number
  item: BusinessMediaItem | null
  busy: boolean
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const label = photoLabels[index]
  return (
    <li className="min-w-0 border bg-background">
      <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden bg-muted/40 sm:aspect-[4/3]">
        {item ? (
          <img
            src={item.dataUrl}
            alt={`${label}: ${item.name}`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <ImagePlus aria-hidden="true" className="size-7" />
            <span className="text-sm">No photo added</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="font-medium">{label}</p>
          {item && (
            <p
              className="truncate text-sm text-muted-foreground"
              title={item.name}
            >
              {item.name}
            </p>
          )}
        </div>
        <FieldGroup>
          <Field>
            <Input
              ref={inputRef}
              id={`premises-photo-${index}`}
              type="file"
              aria-label={
                item
                  ? `Replace ${label.toLowerCase()}`
                  : `Upload ${label.toLowerCase()}`
              }
              accept={acceptedImages}
              className="sr-only max-w-px"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onUpload(file)
                event.currentTarget.value = ""
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                <Upload data-icon="inline-start" aria-hidden="true" />
                {item ? "Replace photo" : "Upload photo"}
              </Button>
              {item && (
                <Button variant="ghost" disabled={busy} onClick={onRemove}>
                  <Trash2 data-icon="inline-start" aria-hidden="true" />
                  Remove
                </Button>
              )}
            </div>
          </Field>
        </FieldGroup>
      </div>
    </li>
  )
}

export function BusinessProfilePage({
  showPremisesDetails = true,
}: {
  showPremisesDetails?: boolean
}) {
  const { state: business, isHydrated: businessReady } = useBusinessSession()
  const {
    media,
    isHydrated: mediaReady,
    uploadAvatar,
    removeAvatar,
    uploadPhoto,
    removePhoto,
  } = useBusinessMedia()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [photoError, setPhotoError] = useState("")

  if (!businessReady || !mediaReady) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <span className="sr-only">Loading business profile</span>
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const profile = business.profile
  if (!profile) return null
  const premises = profile.premises
  const initials = profile.businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
  const photoCount = media.photos.filter(Boolean).length
  const council = seedDatabase.councils.find(
    (item) => item.id === premises?.councilId
  )

  async function selectAvatar(file: File) {
    setBusy(true)
    setAvatarError("")
    const result = await uploadAvatar(file)
    if (!result.ok) setAvatarError(result.error)
    else notifySuccess("Business logo updated")
    setBusy(false)
  }

  async function selectPhoto(index: number, file: File) {
    setBusy(true)
    setPhotoError("")
    const result = await uploadPhoto(index, file)
    if (!result.ok) setPhotoError(result.error)
    else notifySuccess("Premises photo saved")
    setBusy(false)
  }

  return (
    <div className="flex min-w-0 flex-col gap-8 pb-12">
      <section
        aria-labelledby="business-identity"
        className="grid min-w-0 gap-6 pb-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-8"
      >
        <Avatar className="size-24 sm:size-28">
          {media.avatar && (
            <AvatarImage
              src={media.avatar.dataUrl}
              alt={`${profile.businessName} logo`}
            />
          )}
          <AvatarFallback className="text-2xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2
            id="business-identity"
            className="text-xl font-semibold tracking-tight"
          >
            {profile.businessName}
          </h2>
          {showPremisesDetails && (
            <p className="mt-1 text-sm text-muted-foreground">
              {premises?.premisesName ?? "Premises details not recorded"}
            </p>
          )}
          <FieldGroup className="mt-5 max-w-md">
            <Field>
              <Input
                ref={avatarInputRef}
                id="business-avatar"
                type="file"
                aria-label="Upload business avatar or logo"
                accept={acceptedImages}
                className="sr-only max-w-px"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void selectAvatar(file)
                  event.currentTarget.value = ""
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Upload data-icon="inline-start" aria-hidden="true" />
                  {media.avatar ? "Replace image" : "Upload avatar or logo"}
                </Button>
                {media.avatar && (
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      const result = removeAvatar()
                      setAvatarError(result.ok ? "" : result.error)
                      if (result.ok) notifySuccess("Business logo removed")
                    }}
                  >
                    <Trash2 data-icon="inline-start" aria-hidden="true" />
                    Remove image
                  </Button>
                )}
              </div>
            </Field>
          </FieldGroup>
          <p className="mt-3 text-xs text-muted-foreground">
            PNG, JPG, or WebP · up to 8 MB
          </p>
          {avatarError && (
            <Alert variant="destructive" role="alert" className="mt-4 max-w-lg">
              <AlertDescription>{avatarError}</AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      <BusinessProfileForm
        profile={profile}
        showPremisesDetails={showPremisesDetails}
      />

      <section aria-labelledby="business-record" className="max-w-4xl">
        <h2 id="business-record" className="text-lg font-semibold">
          Business record
        </h2>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Reference details assigned to this business and premises.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <label htmlFor="business-council" className="text-sm font-medium">
              Council
            </label>
            <Input
              id="business-council"
              value={council?.name ?? premises?.councilId ?? "Not recorded"}
              readOnly
              className="min-h-11 bg-muted/40 shadow-none"
            />
          </Field>
          <Field>
            <label htmlFor="business-reference" className="text-sm font-medium">
              Business reference
            </label>
            <Input
              id="business-reference"
              value={profile.id}
              readOnly
              className="min-h-11 bg-muted/40 shadow-none"
            />
          </Field>
        </div>
      </section>

      <section aria-labelledby="premises-images" className="min-w-0 pt-2">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="premises-images" className="text-lg font-semibold">
              Premises and kitchen photos
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Add views of your premises, kitchen, and working areas.
            </p>
          </div>
          <Badge variant="secondary">{photoCount} of 3 photos</Badge>
        </div>
        {photoError && (
          <Alert variant="destructive" role="alert" className="mb-5">
            <AlertDescription>{photoError}</AlertDescription>
          </Alert>
        )}
        <ul className="grid min-w-0 gap-4 md:grid-cols-3">
          {media.photos.map((item, index) => (
            <PhotoSlot
              key={index}
              index={index}
              item={item}
              busy={busy}
              onUpload={(file) => void selectPhoto(index, file)}
              onRemove={() => {
                const result = removePhoto(index)
                setPhotoError(result.ok ? "" : result.error)
                if (result.ok) notifySuccess("Premises photo removed")
              }}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
