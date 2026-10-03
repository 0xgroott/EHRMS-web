import { Mail, MapPin, Phone } from "lucide-react"
import type { Premises } from "@/domain/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyValueButton } from "./copy-value-button"
import { resolvePremisesProfile } from "./premises-profile-data"
import { VerifiedBusinessName } from "./verified-business-name"

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

export function PremisesOverviewCard({ premises }: { premises: Premises }) {
  const profile = resolvePremisesProfile(premises)

  return (
    <aside
      aria-label="Business overview"
      data-slot="premises-overview-sidebar"
      className="lg:sticky lg:top-24 lg:self-start"
    >
      <Card>
        <CardHeader className="justify-items-center text-center">
          <Avatar size="2xl" className="size-20">
            {profile.avatar && (
              <AvatarImage
                src={profile.avatar.dataUrl}
                alt={`${profile.businessName} logo`}
              />
            )}
            <AvatarFallback className="text-xl font-semibold">
              {initials(profile.businessName)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-3">
            <h1 className="text-xl font-semibold tracking-tight">
              <VerifiedBusinessName
                name={profile.businessName}
                verified={premises.kybVerified}
              />
            </h1>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <section aria-labelledby="premises-business-details">
            <h2
              id="premises-business-details"
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Business details
            </h2>
            <div className="mt-3 flex flex-col gap-3 text-sm">
              {profile.email && (
                <div className="flex min-w-0 items-center gap-1">
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                  >
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate" title={profile.email}>
                      {profile.email}
                    </span>
                  </a>
                  <CopyValueButton
                    value={profile.email}
                    label="email address"
                  />
                </div>
              )}
              {profile.phone && (
                <div className="flex min-w-0 items-center gap-1">
                  <a
                    href={phoneHref(profile.phone)}
                    className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                  >
                    <Phone className="size-4 shrink-0" aria-hidden="true" />
                    <span>{profile.phone}</span>
                  </a>
                  <CopyValueButton value={profile.phone} label="phone number" />
                </div>
              )}
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{profile.address}</span>
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </aside>
  )
}
