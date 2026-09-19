import { useBusinessSession } from "@/app/business-session"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFumigation } from "./fumigation-context"
import { findLicensedProvider } from "./fumigation-seeds"
import { FumigationLink, FumigationLoading } from "./fumigation-shared"

function CertificateDate({ value }: { value: string }) {
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))}
    </time>
  )
}

export function FumigationCertificatePage() {
  const { state, isHydrated } = useFumigation()
  const { state: businessState } = useBusinessSession()
  if (!isHydrated) return <FumigationLoading />
  const application = state.application
  const certificate =
    application?.stage === "issued" ? application.certificate : undefined
  if (!certificate)
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Business certificates"
          title="No Fumigation Certificate yet"
          description="The certificate appears after the provider report, EHO confirmation, and council decision."
        />
        <FumigationLink
          href={
            application
              ? "/business/fumigation/tracker"
              : "/business/fumigation/apply"
          }
        >
          {application ? "Track application" : "Start application"}
        </FumigationLink>
      </div>
    )
  const premises = businessState.profile?.premises
  const provider = findLicensedProvider(application?.providerId ?? "")
  const council = seedDatabase.councils.find(
    (item) => item.id === certificate.councilId
  )
  return (
    <div className="flex max-w-4xl min-w-0 flex-col gap-6 pb-12">
      <PageHeader
        eyebrow="Business certificates"
        title="Fumigation Certificate"
        description="Certificate coverage for your registered premises."
      />
      <Alert>
        <AlertTitle>Certificate simulation</AlertTitle>
        <AlertDescription>
          This record shows the issued outcome in the prototype. It is not an
          official council document and cannot be used for regulatory purposes.
        </AlertDescription>
      </Alert>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-accent/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                EHRCMS · Premises compliance
              </p>
              <CardTitle className="mt-3">
                <h2 className="text-2xl">Fumigation Certificate</h2>
              </CardTitle>
            </div>
            <Badge variant="secondary">Issued</Badge>
          </div>
          <p className="mt-2 text-sm break-all text-muted-foreground">
            {certificate.id}
          </p>
        </CardHeader>
        <CardContent className="pt-7">
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Premises</dt>
              <dd className="mt-1 font-semibold">{premises?.premisesName}</dd>
              <dd className="text-sm">{premises?.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Licensed provider
              </dt>
              <dd className="mt-1 font-semibold">{provider?.name}</dd>
              <dd className="text-sm">
                Registration {provider?.registrationNumber}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Work date</dt>
              <dd className="mt-1">
                <CertificateDate value={certificate.workDate} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Supervising office
              </dt>
              <dd className="mt-1">{council?.name ?? certificate.councilId}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Issue date</dt>
              <dd className="mt-1">
                <CertificateDate value={certificate.issuedAt} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Expiry date</dt>
              <dd className="mt-1">
                <CertificateDate value={certificate.expiresAt} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <FumigationLink href="/business/fumigation/tracker" variant="outline">
          View application
        </FumigationLink>
        <FumigationLink href="/business/certificates" variant="link">
          Back to certificates
        </FumigationLink>
      </div>
    </div>
  )
}
