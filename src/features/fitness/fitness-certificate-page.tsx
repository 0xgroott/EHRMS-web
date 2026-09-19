import { useBusinessSession } from "@/app/business-session"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useFitness } from "./fitness-context"
import { useFumigation } from "@/features/fumigation/fumigation-context"
import { FumigationLink } from "@/features/fumigation/fumigation-shared"
import {
  FitnessEmptyState,
  FitnessLink,
  FitnessLoading,
  formatFitnessReference,
} from "./fitness-tracker-page"

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

export function FitnessCertificatePage() {
  const { state, isHydrated } = useFitness()
  const { state: businessState } = useBusinessSession()
  if (!isHydrated) return <FitnessLoading />
  const certificate = state.application?.certificate
  if (!certificate || state.application?.stage !== "issued") {
    return (
      <FitnessEmptyState
        title="No Fitness certificate yet"
        description="A certificate appears after payment, a Fit result from the facility, and the council decision."
        href={
          state.application
            ? "/business/fitness/tracker"
            : "/business/fitness/apply"
        }
        label={
          state.application
            ? "Track Fitness application"
            : "Start Fitness application"
        }
      />
    )
  }
  const council = seedDatabase.councils.find(
    (item) => item.id === certificate.councilId
  )
  const premises = businessState.profile?.premises
  const people = state.handlers.filter((handler) =>
    certificate.handlerIds.includes(handler.id)
  )
  return (
    <div className="flex max-w-4xl min-w-0 flex-col gap-6 break-words">
      <PageHeader
        eyebrow="Business certificates"
        title="Fitness Certificate"
        description="Certificate details for your premises and food handlers."
      />
      <Alert>
        <AlertTitle>Simulation only</AlertTitle>
        <AlertDescription>
          Not valid for regulatory use. This simulated certificate is not an
          official council document.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <Badge variant="secondary">Issued</Badge>
          <CardTitle>
            <h2>Fitness Certificate details</h2>
          </CardTitle>
          <CardDescription className="break-all">
            {formatFitnessReference(certificate.id)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Premises</dt>
              <dd className="mt-1 font-medium">{premises?.premisesName}</dd>
              <dd className="text-sm text-muted-foreground">
                {premises?.address}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Issuing council</dt>
              <dd className="mt-1 font-medium">
                {council?.name ?? certificate.councilId}
              </dd>
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
          <section className="border-t pt-5">
            <h3 className="font-medium">
              Covered food handlers · {people.length}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {people.map((handler) => (
                <li key={handler.id}>
                  <p>{handler.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {handler.role}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <FitnessLink href="/business/fitness/tracker" variant="outline">
          View application
        </FitnessLink>
        <FitnessLink href="/business/certificates" variant="link">
          Back to certificates
        </FitnessLink>
      </div>
    </div>
  )
}

export function BusinessCertificatesPage() {
  const { state, isHydrated } = useFitness()
  const { state: fumigation, isHydrated: fumigationIsHydrated } =
    useFumigation()
  if (!isHydrated || !fumigationIsHydrated) return <FitnessLoading />
  const application = state.application
  const fumigationApplication = fumigation.application
  const fumigationCertificate =
    fumigationApplication?.stage === "issued"
      ? fumigationApplication.certificate
      : undefined
  const certificate =
    application?.stage === "issued" ? application.certificate : undefined
  const submitted =
    application && !["draft", "review"].includes(application.stage)
  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-6 break-words">
      <PageHeader
        eyebrow="Business portal"
        title="Certificates"
        description="View certificate coverage for your premises and food handlers."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Fitness Certificate</h2>
          </CardTitle>
          <Badge variant="secondary">
            {certificate ? "Issued" : "Not issued"}
          </Badge>
          <CardDescription>
            {certificate
              ? "Coverage for the selected food handlers."
              : "Complete the Fitness application, assessment, and council decision to see a certificate."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificate ? (
            <div className="flex flex-col gap-2">
              <p className="break-all">
                {formatFitnessReference(certificate.id)}
              </p>
              <p className="text-sm text-muted-foreground">
                {certificate.handlerIds.length} food{" "}
                {certificate.handlerIds.length === 1 ? "handler" : "handlers"}{" "}
                covered
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No Fitness certificate yet.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <FitnessLink
            href={
              certificate
                ? "/business/fitness/certificate"
                : submitted
                  ? "/business/fitness/tracker"
                  : "/business/fitness/apply"
            }
          >
            {certificate
              ? "View Fitness Certificate"
              : submitted
                ? "Track Fitness application"
                : application
                  ? "Continue Fitness application"
                  : "Start Fitness application"}
          </FitnessLink>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Fumigation Certificate</h2>
          </CardTitle>
          <Badge variant="secondary">
            {fumigationCertificate ? "Issued" : "Not issued"}
          </Badge>
          <CardDescription>
            {fumigationCertificate
              ? "Coverage for your registered premises."
              : "Complete the provider service, EHO confirmation, and council decision to see a certificate."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {fumigationCertificate?.id ?? "No Fumigation Certificate yet."}
          </p>
        </CardContent>
        <CardFooter>
          <FumigationLink
            href={
              fumigationCertificate
                ? "/business/fumigation/certificate"
                : fumigationApplication &&
                    !["draft", "review"].includes(fumigationApplication.stage)
                  ? "/business/fumigation/tracker"
                  : "/business/fumigation/apply"
            }
          >
            {fumigationCertificate
              ? "View Fumigation Certificate"
              : fumigationApplication
                ? "Track Fumigation application"
                : "Start Fumigation application"}
          </FumigationLink>
        </CardFooter>
      </Card>
      <section
        aria-labelledby="health-approval"
        className="flex flex-col gap-2"
      >
        <h2 id="health-approval" className="font-semibold">
          Health Approval
        </h2>
        <p className="text-sm text-muted-foreground">
          Requires valid Fitness and Fumigation Certificates, eligibility
          checks, and inspection. This workflow is coming in a later slice.
        </p>
      </section>
    </div>
  )
}
