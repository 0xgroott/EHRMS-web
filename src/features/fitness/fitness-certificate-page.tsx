import { useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import {
  certificateIsValid,
  certificateReminder,
  latestCertificateApplication,
} from "@/domain/certificate-validity"
import { notifySuccessAfterNavigation } from "@/components/ui/app-toast"
import { seedDatabase } from "@/data/seeds"
import { fitnessCertificateDocument } from "@/domain/business-document-downloads"
import { PageHeader } from "@/components/shared/page-header"
import { CertificateCard } from "@/components/shared/certificate-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFitness } from "./fitness-context"
import { useFumigation } from "@/features/fumigation/fumigation-context"
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
  const { state: fumigation, isHydrated: fumigationIsHydrated } =
    useFumigation()
  const { state: inspection, isHydrated: inspectionIsHydrated } =
    useInspection()
  if (!isHydrated || !fumigationIsHydrated || !inspectionIsHydrated)
    return <FitnessLoading />

  const application = state.application
  const fumigationApplication = fumigation.application
  const fitnessCertificate = latestCertificateApplication(
    application,
    state.history
  )?.certificate
  const fumigationCertificate = latestCertificateApplication(
    fumigationApplication,
    fumigation.history
  )?.certificate
  const healthCertificate = inspection.inspection?.certificate
  const fitnessValid = Boolean(
    fitnessCertificate && certificateIsValid(fitnessCertificate.expiresAt)
  )
  const fumigationValid = Boolean(
    fumigationCertificate && certificateIsValid(fumigationCertificate.expiresAt)
  )
  const healthValid = Boolean(
    healthCertificate && certificateIsValid(healthCertificate.expiresAt)
  )
  const inspectionInProgress = Boolean(inspection.inspection)
  const inspectionComplete = Boolean(
    healthCertificate ||
    inspection.inspection?.stage === "resolved" ||
    inspection.inspection?.stage === "approval-issued"
  )

  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-6 break-words">
      <PageHeader eyebrow="Business portal" title="Certificates" />

      <section
        aria-label="Certificate overview"
        className="grid min-w-0 gap-4 md:grid-cols-2"
      >
        <CertificateCard
          type="Fitness"
          reference={
            fitnessCertificate
              ? formatFitnessReference(fitnessCertificate.id)
              : "Not issued"
          }
          expiresAt={fitnessCertificate?.expiresAt}
          issued={Boolean(fitnessCertificate)}
          href={
            fitnessCertificate ? "/business/fitness/certificate" : undefined
          }
        />
        <CertificateCard
          type="Fumigation"
          reference={fumigationCertificate?.id ?? "Not issued"}
          expiresAt={fumigationCertificate?.expiresAt}
          issued={Boolean(fumigationCertificate)}
          href={
            fumigationCertificate
              ? "/business/fumigation/certificate"
              : undefined
          }
        />
        <CertificateCard
          type="Health Approval"
          reference={healthCertificate?.id ?? "Not issued"}
          expiresAt={healthCertificate?.expiresAt}
          issued={Boolean(healthCertificate)}
          href={healthCertificate ? "/business/health-approval" : undefined}
          className="md:col-span-2"
        />
      </section>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            View checklist
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Health Approval checklist</DialogTitle>
              <DialogDescription>
                Complete these steps before your premises can receive final
                approval.
              </DialogDescription>
            </DialogHeader>
            <ul className="divide-y" aria-label="Health Approval steps">
              {[
                {
                  label: "Fitness Certificate",
                  complete: fitnessValid,
                  status: fitnessValid ? "Complete" : "Required",
                },
                {
                  label: "Fumigation Certificate",
                  complete: fumigationValid,
                  status: fumigationValid ? "Complete" : "Required",
                },
                {
                  label: "Council inspection",
                  complete: inspectionComplete,
                  status: inspectionComplete
                    ? "Complete"
                    : inspectionInProgress
                      ? "In progress"
                      : "Pending",
                },
                {
                  label: "Health Approval decision",
                  complete: healthValid,
                  status: healthValid ? "Approved" : "Pending",
                },
              ].map((step) => (
                <li
                  key={step.label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3 font-medium">
                    {step.complete ? (
                      <CheckCircle2
                        className="size-5 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    {step.label}
                  </span>
                  <Badge variant={step.complete ? "success" : "outline"}>
                    {step.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
