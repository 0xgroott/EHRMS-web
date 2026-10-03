import { AtSign, ExternalLink, Globe2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Premises } from "@/domain/types"
import { seedDatabase } from "@/data/seeds"
import { Separator } from "@/components/ui/separator"
import { resolvePremisesProfile } from "./premises-profile-data"
import { StatusBadge } from "./status-badge"

const publicLinkDetails: Array<{
  key: "website" | "instagram" | "facebook" | "x"
  label: string
  icon: LucideIcon
}> = [
  { key: "website", label: "Website", icon: Globe2 },
  { key: "instagram", label: "Instagram", icon: AtSign },
  { key: "facebook", label: "Facebook", icon: AtSign },
  { key: "x", label: "X", icon: AtSign },
]

function safePublicHref(value: string | undefined) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? value : null
  } catch {
    return null
  }
}

function displayPublicHref(value: string) {
  const url = new URL(value)
  return `${url.hostname.replace(/^www\./, "")}${
    url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "")
  }`
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium break-words">{value}</dd>
    </div>
  )
}

export function PremisesBusinessInfoPanel({
  premises,
}: {
  premises: Premises
}) {
  const profile = resolvePremisesProfile(premises)
  const council = seedDatabase.councils.find(
    (item) => item.id === premises.councilId
  )
  const publicLinks = publicLinkDetails.flatMap((item) => {
    const href = safePublicHref(profile.links[item.key])
    return href ? [{ ...item, href }] : []
  })

  return (
    <section aria-labelledby="business-information-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="business-information-title" className="text-lg font-semibold">
            Business information
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Registration and premises details held by the council.
          </p>
        </div>
        <StatusBadge status={premises.complianceStatus} />
      </div>

      <Separator className="my-6" />

      <div className="grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="registered-business-title">
          <h3 id="registered-business-title" className="font-semibold">
            Registered business
          </h3>
          <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Detail label="Business name" value={profile.businessName} />
            <Detail label="Trading name" value={profile.tradingName} />
            <Detail label="Registered owner" value={profile.contactName} />
            <Detail
              label="Registration number"
              value={profile.registrationNumber}
            />
          </dl>
        </section>

        <section aria-labelledby="registered-premises-title">
          <h3 id="registered-premises-title" className="font-semibold">
            Premises record
          </h3>
          <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Detail label="Premises name" value={profile.premisesName} />
            <Detail label="Business type" value={profile.premisesType} />
            <Detail label="Ward" value={profile.ward} />
            <Detail
              label="Council"
              value={council?.name ?? premises.councilId}
            />
            <Detail label="System ID" value={premises.id} />
          </dl>
        </section>
      </div>

      {publicLinks.length > 0 && (
        <section className="mt-8" aria-labelledby="business-online-title">
          <Separator className="mb-6" />
          <h3 id="business-online-title" className="font-semibold">
            Online presence
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {publicLinks.map(({ key, label, icon: Icon, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="inline-flex min-h-10 min-w-0 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate" title={href}>
                  {displayPublicHref(href)}
                </span>
                <ExternalLink
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
