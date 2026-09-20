import { useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import {
  certificateIsValid,
  certificateReminder,
  latestCertificateApplication,
} from "@/domain/certificate-validity"
import { notifySuccessAfterNavigation } from "@/components/ui/app-toast"
import { seedDatabase } from "@/data/seeds"
import {
  fitnessCertificateDocument,
  fumigationCertificateDocument,
} from "@/domain/business-document-downloads"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { findLicensedProvider } from "@/features/fumigation/fumigation-seeds"
import { useInspection } from "@/features/inspection/inspection-context"
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
  const { state, isHydrated, startRenewal } = useFitness()
  const [renewalError, setRenewalError] = useState("")
  const { state: businessState } = useBusinessSession()
  if (!isHydrated) return <FitnessLoading />
  const issuedApplication = latestCertificateApplication(
    state.application,
    state.history
  )
  const certificate = issuedApplication?.certificate
  if (!certificate) {
    return (
      <FitnessEmptyState
        title="No Fitness certificate yet"
        description="A certificate appears after payment, a Fit result from the facility, and the council decision."
        href={
          state.application &&
          !["draft", "review"].includes(state.application.stage)
            ? "/business/fitness/tracker"
            : "/business/fitness/apply"
        }
        label={
          state.application &&
          !["draft", "review"].includes(state.application.stage)
            ? "Track Fitness application"
            : state.application
              ? "Continue Fitness application"
              : "Start Fitness application"
        }
      />
    )
  }
  const council = seedDatabase.councils.find(
    (item) => item.id === certificate.councilId
  )
  const premises = businessState.profile?.premises
  const people = (issuedApplication.handlerSnapshots ?? state.handlers).filter(
    (handler) => certificate.handlerIds.includes(handler.id)
  )
  const reminder = certificateReminder(
    certificate.expiresAt,
    new Date(),
    Boolean(
      state.history?.length &&
      state.application?.stage !== "issued" &&
      state.application?.purpose !== "new-staff"
    )
  )
  return (
    <div className="flex max-w-4xl min-w-0 flex-col gap-6 break-words">
      <PageHeader
        eyebrow="Business certificates"
        title="Fitness Certificate"
        description="Certificate details for your premises and food handlers."
      />
      {reminder && (
        <Alert>
          <AlertDescription>{reminder}</AlertDescription>
        </Alert>
      )}
      {renewalError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{renewalError}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <Badge variant="secondary">
            {certificateIsValid(certificate.expiresAt) ? "Issued" : "Expired"}
          </Badge>
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
        <DocumentDownloadButton
          document={fitnessCertificateDocument(
            issuedApplication,
            state.handlers,
            businessState.profile
          )}
          variant="default"
        >
          Download certificate
        </DocumentDownloadButton>
        {state.application?.stage === "issued" && (
          <Button
            variant="outline"
            onClick={() => {
              const result = startRenewal()
              if (!result.ok) return setRenewalError(result.error)
              notifySuccessAfterNavigation("Fitness renewal started")
              globalThis.location.assign("/business/fitness/apply")
            }}
          >
            Start renewal
          </Button>
        )}
        {!state.application && Boolean(state.history?.length) && (
          <FitnessLink href="/business/fitness/apply">
            Continue renewal
          </FitnessLink>
        )}
        <FitnessLink
          href={
            state.application &&
            !["draft", "review"].includes(state.application.stage)
              ? "/business/fitness/tracker"
              : "/business/applications"
          }
          variant="outline"
        >
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
  const { state: businessState } = useBusinessSession()
  const { state: fumigation, isHydrated: fumigationIsHydrated } =
    useFumigation()
  const { state: inspection, isHydrated: inspectionIsHydrated } =
    useInspection()
  if (!isHydrated || !fumigationIsHydrated || !inspectionIsHydrated)
    return <FitnessLoading />
  const application = state.application
  const fumigationApplication = fumigation.application
  const fumigationCertificate = latestCertificateApplication(
    fumigationApplication,
    fumigation.history
  )?.certificate
  const certificate = latestCertificateApplication(
    application,
    state.history
  )?.certificate
  const fitnessReminder = certificate
    ? certificateReminder(
        certificate.expiresAt,
        new Date(),
        Boolean(
          state.history?.length &&
          application?.stage !== "issued" &&
          application?.purpose !== "new-staff"
        )
      )
    : null
  const fumigationReminder = fumigationCertificate
    ? certificateReminder(
        fumigationCertificate.expiresAt,
        new Date(),
        Boolean(
          fumigation.history?.length &&
          fumigationApplication?.stage !== "issued"
        )
      )
    : null
  const submitted =
    application && !["draft", "review"].includes(application.stage)
  const healthCertificate = inspection.inspection?.certificate
  const healthEligible = Boolean(
    certificate &&
    certificateIsValid(certificate.expiresAt) &&
    fumigationCertificate &&
    certificateIsValid(fumigationCertificate.expiresAt)
  )
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
            {certificate
              ? certificateIsValid(certificate.expiresAt)
                ? "Issued"
                : "Expired"
              : "Not issued"}
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
              {fitnessReminder && (
                <p className="text-sm text-foreground">{fitnessReminder}</p>
              )}
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
      {(state.history?.length ?? 0) > 0 && (
        <section
          aria-labelledby="fitness-certificate-history"
          className="space-y-3"
        >
          <h2
            id="fitness-certificate-history"
            className="text-lg font-semibold"
          >
            Previous Fitness certificates
          </h2>
          <ul className="divide-y rounded-lg border">
            {[...(state.history ?? [])]
              .reverse()
              .filter((item) => item.certificate)
              .map((item) => (
                <li key={item.id} className="p-4 text-sm">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      {formatFitnessReference(item.certificate!.id)} · expires{" "}
                      <CertificateDate value={item.certificate!.expiresAt} />
                    </summary>
                    <div className="mt-3 space-y-1 text-muted-foreground">
                      <p>Application: {item.id}</p>
                      <p>
                        Issued:{" "}
                        <CertificateDate value={item.certificate!.issuedAt} />
                      </p>
                      <p>
                        {item.certificate!.handlerIds.length} food handlers
                        covered
                      </p>
                      {item.handlerSnapshots && (
                        <p>
                          {item.handlerSnapshots
                            .map((handler) => handler.fullName)
                            .join(", ")}
                        </p>
                      )}
                      {item.paymentReference && (
                        <p className="break-all">
                          Payment reference: {item.paymentReference}
                        </p>
                      )}
                      <DocumentDownloadButton
                        document={fitnessCertificateDocument(
                          item,
                          state.handlers,
                          businessState.profile
                        )}
                      >
                        Download certificate
                      </DocumentDownloadButton>
                    </div>
                  </details>
                </li>
              ))}
          </ul>
        </section>
      )}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Fumigation Certificate</h2>
          </CardTitle>
          <Badge variant="secondary">
            {fumigationCertificate
              ? certificateIsValid(fumigationCertificate.expiresAt)
                ? "Issued"
                : "Expired"
              : "Not issued"}
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
          {fumigationReminder && (
            <p className="mt-2 text-sm">{fumigationReminder}</p>
          )}
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
      {(fumigation.history?.length ?? 0) > 0 && (
        <section
          aria-labelledby="fumigation-certificate-history"
          className="space-y-3"
        >
          <h2
            id="fumigation-certificate-history"
            className="text-lg font-semibold"
          >
            Previous Fumigation certificates
          </h2>
          <ul className="divide-y rounded-lg border">
            {[...(fumigation.history ?? [])]
              .reverse()
              .filter((item) => item.certificate)
              .map((item) => (
                <li key={item.id} className="p-4 text-sm">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      {item.certificate!.id} · expires{" "}
                      <CertificateDate value={item.certificate!.expiresAt} />
                    </summary>
                    <div className="mt-3 space-y-1 text-muted-foreground">
                      <p>Application: {item.id}</p>
                      <p>
                        Work date:{" "}
                        <CertificateDate value={item.certificate!.workDate} />
                      </p>
                      <p>
                        Issued:{" "}
                        <CertificateDate value={item.certificate!.issuedAt} />
                      </p>
                      {item.paymentReference && (
                        <p className="break-all">
                          Payment reference: {item.paymentReference}
                        </p>
                      )}
                      <DocumentDownloadButton
                        document={fumigationCertificateDocument(
                          item,
                          businessState.profile,
                          findLicensedProvider(item.providerId ?? "")?.name
                        )}
                      >
                        Download certificate
                      </DocumentDownloadButton>
                    </div>
                  </details>
                </li>
              ))}
          </ul>
        </section>
      )}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Health Approval</h2>
          </CardTitle>
          <Badge variant="secondary">
            {healthCertificate
              ? "Issued"
              : healthEligible
                ? "Inspection pending"
                : "Requirements incomplete"}
          </Badge>
          <CardDescription>
            {healthCertificate
              ? "Approval outcome for your registered premises."
              : "Follows Fitness, Fumigation, eligibility checks, and inspection."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {healthCertificate?.id ??
              (healthEligible
                ? "Follow the inspection and council decision."
                : "Complete the missing certificate requirements first.")}
          </p>
        </CardContent>
        <CardFooter>
          <FitnessLink href="/business/health-approval">
            View Health Approval
          </FitnessLink>
        </CardFooter>
      </Card>
    </div>
  )
}
