import { ArrowUpRight, Award } from "lucide-react"
import type { CertificateSummary } from "@/domain/types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "cn"

type CertificateType = CertificateSummary["type"]

const presentation: Record<
  CertificateType,
  {
    title: string
    identity: string
    card: string
    metadata: string
    seal: string
    arrow: string
  }
> = {
  Fitness: {
    title: "Fitness Certificate",
    identity: "fitness",
    card: "bg-[var(--surface-certificate-fitness)] text-[var(--text-certificate-fitness-strong)]",
    metadata: "text-[var(--text-certificate-fitness-weak)]",
    seal: "text-[var(--icon-certificate-fitness)]",
    arrow:
      "bg-[var(--icon-certificate-fitness)] text-[var(--surface-certificate-fitness)]",
  },
  Fumigation: {
    title: "Fumigation Certificate",
    identity: "fumigation",
    card: "bg-[var(--surface-certificate-fumigation)] text-[var(--text-certificate-fumigation-strong)]",
    metadata: "text-[var(--text-certificate-fumigation-weak)]",
    seal: "text-[var(--icon-certificate-fumigation)]",
    arrow:
      "bg-[var(--icon-certificate-fumigation)] text-[var(--surface-certificate-fumigation)]",
  },
  "Health Approval": {
    title: "Health Approval",
    identity: "health-approval",
    card: "bg-[var(--surface-certificate-health-approval)] text-[var(--text-certificate-health-approval-strong)]",
    metadata: "text-[var(--text-certificate-health-approval-weak)]",
    seal: "text-[var(--icon-certificate-health-approval)]",
    arrow:
      "bg-[var(--icon-certificate-health-approval)] text-[var(--surface-certificate-health-approval)]",
  },
}

function formatCertificateDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function CertificateSeal({ className }: { className: string }) {
  return (
    <Award
      data-slot="certificate-seal"
      className={cn(
        "pointer-events-none absolute right-5 bottom-4 size-24 opacity-90 sm:right-6 sm:bottom-5 sm:size-28",
        className
      )}
      strokeWidth={1.25}
      aria-hidden="true"
    />
  )
}

export function CertificateCard({
  type,
  reference,
  expiresAt,
  href,
  issued: issuedProp,
  className,
}: {
  type: CertificateType
  reference: string
  expiresAt?: string
  issued?: boolean
  href?: string
  className?: string
}) {
  const details = presentation[type]
  const issued = issuedProp ?? Boolean(expiresAt || href)
  const card = (
    <Card
      role="region"
      aria-label={details.title}
      data-certificate-kind={details.identity}
      className={cn(
        "group relative min-h-60 min-w-0 gap-0 overflow-hidden border-0 py-0 shadow-none ring-0",
        details.card,
        className
      )}
    >
      <CardContent className="relative flex min-h-60 flex-1 flex-col px-6 py-6 sm:px-7 sm:py-7">
        <h2 className="max-w-[75%] text-2xl leading-tight font-semibold tracking-tight sm:text-[1.75rem]">
          {details.title}
        </h2>
        {href && (
          <span
            data-slot="certificate-open-arrow"
            className={cn(
              "absolute top-5 right-5 grid size-10 translate-y-1 place-items-center rounded-full opacity-0 transition-[opacity,transform] duration-150 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 sm:top-6 sm:right-6",
              details.arrow
            )}
            aria-hidden="true"
          >
            <ArrowUpRight className="size-5" />
          </span>
        )}
        <div className={cn("mt-auto max-w-[68%] pt-14", details.metadata)}>
          {issued ? (
            <>
              <p className="text-sm font-semibold break-all">{reference}</p>
              {expiresAt && (
                <p className="mt-1 text-sm">
                  Expires{" "}
                  <time dateTime={expiresAt}>
                    {formatCertificateDate(expiresAt)}
                  </time>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm font-semibold">Not issued</p>
          )}
        </div>
        <CertificateSeal className={details.seal} />
      </CardContent>
    </Card>
  )

  if (!href) return card

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${details.title} ${reference}`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
    >
      {card}
    </a>
  )
}
