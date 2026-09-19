import { useRef, useState } from "react"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { seedDatabase } from "@/data/seeds"
import { useBusinessMedia } from "./business-media-context"
import type { BusinessMediaItem } from "./business-media-store"

const acceptedImages = "image/png,image/jpeg,image/webp"
const photoLabels = ["Premises photo 1", "Premises photo 2", "Premises photo 3"]

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 border-t pt-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium break-words">
        {value || "Not recorded"}
      </dd>
    </div>
  )
}

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
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/40">
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
            <FieldLabel htmlFor={`premises-photo-${index}`} className="sr-only">
              {item
                ? `Replace ${label.toLowerCase()}`
                : `Upload ${label.toLowerCase()}`}
            </FieldLabel>
            <Input
              ref={inputRef}
              id={`premises-photo-${index}`}
              type="file"
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

export function BusinessProfilePage() {
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
  const council = seedDatabase.councils.find(
    (item) => item.id === premises?.councilId
  )
  const initials = profile.businessName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
  const photoCount = media.photos.filter(Boolean).length

  async function selectAvatar(file: File) {
    setBusy(true)
    setAvatarError("")
    const result = await uploadAvatar(file)
    if (!result.ok) setAvatarError(result.error)
    setBusy(false)
  }

  async function selectPhoto(index: number, file: File) {
    setBusy(true)
    setPhotoError("")
    const result = await uploadPhoto(index, file)
    if (!result.ok) setPhotoError(result.error)
    setBusy(false)
  }

  return (
    <div className="flex max-w-6xl min-w-0 flex-col gap-9 pb-12">
      <PageHeader
        eyebrow="Business account"
        title="Business profile"
        description="Your registered business and premises details."
      />

      <section
        aria-labelledby="business-identity"
        className="grid min-w-0 gap-6 border-y py-7 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-8"
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
          <p className="mt-1 text-sm text-muted-foreground">
            {premises?.premisesName ?? "Premises details not recorded"}
          </p>
          <FieldGroup className="mt-5 max-w-md">
            <Field>
              <FieldLabel htmlFor="business-avatar" className="sr-only">
                Upload business avatar or logo
              </FieldLabel>
              <Input
                ref={avatarInputRef}
                id="business-avatar"
                type="file"
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

      <div className="grid gap-9 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="account-details" className="min-w-0">
          <h2 id="account-details" className="text-lg font-semibold">
            Account details
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Contact person" value={profile.contactName} />
            <Detail label="Phone number" value={profile.phone} />
            <Detail label="Email address" value={profile.email} />
            <Detail label="Business reference" value={profile.id} />
          </dl>
        </section>
        <section aria-labelledby="premises-details" className="min-w-0">
          <h2 id="premises-details" className="text-lg font-semibold">
            Registered premises
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Detail label="Premises name" value={premises?.premisesName} />
            <Detail label="Business type" value={premises?.businessType} />
            <Detail label="Address" value={premises?.address} />
            <Detail label="Ward" value={premises?.ward} />
            <Detail
              label="Council"
              value={council?.name ?? premises?.councilId}
            />
            <Detail
              label="Registration number"
              value={premises?.registrationNumber}
            />
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="premises-images"
        className="min-w-0 border-t pt-8"
      >
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
              }}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
