import { Mail, MapPin, Phone } from "lucide-react"
import type { ReactNode } from "react"
import type { Premises } from "@/domain/types"
import { Badge } from "@/components/ui/badge"
import { PremisesAvatar } from "./premises-avatar"
import { VerifiedBusinessName } from "./verified-business-name"

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`
}

export function PremisesProfileHeader({
  premises,
  status,
}: {
  premises: Premises
  status?: ReactNode
}) {
  return (
    <section
      aria-label={`${premises.businessName} profile`}
      data-slot="premises-profile-header"
      className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10"
    >
      <div
        aria-hidden="true"
        data-slot="premises-profile-banner"
        className="h-24 bg-[var(--background-brand-weak)] sm:h-28"
      />
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div
            data-slot="premises-profile-identity"
            className="flex min-w-0 items-center gap-4"
          >
            <PremisesAvatar name={premises.businessName} display="profile" />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <VerifiedBusinessName
                  name={premises.businessName}
                  verified={premises.kybVerified}
                />
              </h1>
              <div
                data-slot="premises-profile-metadata"
                className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
              >
                <span>{premises.premisesType}</span>
                <span aria-hidden="true">·</span>
                <span>{premises.ward}</span>
                <Badge variant="outline">{premises.id}</Badge>
              </div>
            </div>
          </div>
          {status && <div className="shrink-0 sm:ml-auto">{status}</div>}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span>{premises.address}</span>
          </span>
          {premises.email && (
            <a
              href={`mailto:${premises.email}`}
              className="inline-flex min-w-0 items-center gap-2 hover:text-foreground hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span className="break-all">{premises.email}</span>
            </a>
          )}
          {premises.phone && (
            <a
              href={phoneHref(premises.phone)}
              className="inline-flex items-center gap-2 hover:text-foreground hover:underline"
            >
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              {premises.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
