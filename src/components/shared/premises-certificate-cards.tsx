import type { CertificateSummary } from "@/domain/types"
import { CertificateCard } from "./certificate-card"
import { EmptyState } from "./empty-state"

export function PremisesCertificateCards({
  certificates,
  getCertificateHref,
}: {
  certificates: CertificateSummary[]
  getCertificateHref?: (certificate: CertificateSummary) => string | undefined
}) {
  if (!certificates.length) {
    return (
      <EmptyState
        title="No certificates"
        description="No certificate records are linked to this premises."
      />
    )
  }

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      {certificates.map((certificate, index) => {
        const issued = !["Pending", "Not Found"].includes(certificate.status)

        return (
          <CertificateCard
            key={certificate.id ?? `${certificate.type}-${index}`}
            type={certificate.type}
            reference={certificate.id ?? "Not issued"}
            expiresAt={issued ? certificate.expiresAt : undefined}
            issued={issued}
            href={
              issued && certificate.id
                ? getCertificateHref?.(certificate)
                : undefined
            }
          />
        )
      })}
    </div>
  )
}
