import { ArrowLeft, FileBadge2 } from "lucide-react"
import type { CertificateSummary, Premises } from "@/domain/types"
import { PageHeader } from "./page-header"
import { StatusBadge } from "./status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PremisesCertificateDetail({
  premises,
  certificate,
  backHref,
}: {
  premises: Premises
  certificate: CertificateSummary
  backHref: string
}) {
  const found = certificate.status !== "Not Found"

  return (
    <div className="space-y-6">
      <a
        href={backHref}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to premises certificates
      </a>
      <PageHeader
        eyebrow={certificate.id ?? "Certificate record"}
        title={`${certificate.type} certificate`}
        description={`${premises.businessName} · ${premises.id}`}
        actions={<StatusBadge status={certificate.status} />}
      />
      {!found && (
        <Alert>
          <AlertDescription>
            <strong className="block font-medium text-foreground">
              No digital certificate record found
            </strong>
            This status does not establish whether the premises is compliant.
            Check any paper certificate presented during the visit.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileBadge2 className="size-5 text-primary" aria-hidden="true" />
            Record details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            <div className="grid gap-1 py-4 first:pt-0 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-muted-foreground">Certificate type</dt>
              <dd className="font-medium">{certificate.type}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-muted-foreground">Record reference</dt>
              <dd className="font-medium">{certificate.id ?? "Unavailable"}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{certificate.status}</dd>
            </div>
            {found && certificate.expiresAt && (
              <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
                <dt className="text-muted-foreground">Expiry date</dt>
                <dd className="font-medium">{certificate.expiresAt}</dd>
              </div>
            )}
            <div className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-muted-foreground">Premises</dt>
              <dd className="font-medium">{premises.businessName}</dd>
            </div>
            <div className="grid gap-1 py-4 pb-0 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{premises.address}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Certificate details may be out of date when the device is offline.
      </p>
    </div>
  )
}
