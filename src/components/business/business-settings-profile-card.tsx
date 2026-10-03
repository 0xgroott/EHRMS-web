import { useRef, useState } from "react"
import {
  AtSign,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Phone,
} from "lucide-react"
import type {
  BusinessProfile,
  BusinessProfileLinks,
} from "@/domain/business-types"
import { useBusinessMedia } from "@/features/business-media/business-media-context"
import { notifySuccess } from "@/components/ui/app-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const acceptedImages = "image/png,image/jpeg,image/webp"

const publicLinkDetails: {
  key: keyof BusinessProfileLinks
  label: string
  icon: typeof Globe2
}[] = [
  { key: "website", label: "Website", icon: Globe2 },
  { key: "instagram", label: "Instagram", icon: AtSign },
  { key: "facebook", label: "Facebook", icon: AtSign },
  { key: "x", label: "X", icon: AtSign },
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}

function linkDisplayValue(value: string) {
  try {
    const url = new URL(value)
    return `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "")}`
  } catch {
    return value
  }
}

function safePublicHref(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? value : null
  } catch {
    return null
  }
}

export function BusinessSettingsProfileCard({
  profile,
}: {
  profile: BusinessProfile
}) {
  const { media, uploadAvatar } = useBusinessMedia()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const premises = profile.premises
  const publicLinks = publicLinkDetails.flatMap((item) => {
    const storedHref = profile.links?.[item.key]
    const href = storedHref ? safePublicHref(storedHref) : null
    return href ? [{ ...item, href }] : []
  })

  async function selectAvatar(file: File) {
    setBusy(true)
    setAvatarError("")
    const result = await uploadAvatar(file)
    if (!result.ok) setAvatarError(result.error)
    else notifySuccess("Business logo updated")
    setBusy(false)
  }

  return (
    <aside
      aria-label="Business overview"
      data-slot="business-settings-profile-sidebar"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <Card>
        <CardHeader className="justify-items-center text-center">
          <div className="relative">
            <Avatar size="2xl" className="size-20">
              {media.avatar && (
                <AvatarImage
                  src={media.avatar.dataUrl}
                  alt={`${profile.businessName} logo`}
                />
              )}
              <AvatarFallback className="text-xl font-semibold">
                {initials(profile.businessName)}
              </AvatarFallback>
              <AvatarBadge className="size-6 overflow-visible bg-background p-0 text-primary [&>svg]:size-3">
                <Pencil aria-hidden="true" />
                <button
                  type="button"
                  aria-label="Edit business logo"
                  disabled={busy}
                  className="absolute -inset-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => avatarInputRef.current?.click()}
                />
              </AvatarBadge>
            </Avatar>
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
          </div>
          {avatarError && (
            <Alert variant="destructive" role="alert" className="mt-2 w-full">
              <AlertDescription>{avatarError}</AlertDescription>
            </Alert>
          )}
          <CardTitle className="mt-3">
            <h2 className="text-xl font-semibold tracking-tight">
              {profile.businessName}
            </h2>
          </CardTitle>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {premises?.businessType && (
              <Badge variant="secondary">{premises.businessType}</Badge>
            )}
            {premises?.ward && <Badge variant="outline">{premises.ward}</Badge>}
          </div>
        </CardHeader>

        <CardContent className="gap-6">
          <section aria-labelledby="business-overview-contact">
            <h3
              id="business-overview-contact"
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Business details
            </h3>
            <div className="mt-3 flex flex-col gap-3 text-sm">
              {premises?.address && (
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{premises.address}</span>
                </p>
              )}
              <a
                href={`mailto:${profile.email}`}
                className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate" title={profile.email}>
                  {profile.email}
                </span>
              </a>
              {profile.phone && (
                <a
                  href={phoneHref(profile.phone)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                >
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {profile.phone}
                </a>
              )}
            </div>
          </section>

          {publicLinks.length > 0 && (
            <section aria-labelledby="business-overview-links">
              <h3
                id="business-overview-links"
                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Online
              </h3>
              <div className="mt-3 flex flex-col gap-1">
                {publicLinks.map(({ key, label, icon: Icon, href }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="group flex min-h-10 min-w-0 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate" title={href}>
                      {linkDisplayValue(href)}
                    </span>
                    <ExternalLink
                      className="ml-auto size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
