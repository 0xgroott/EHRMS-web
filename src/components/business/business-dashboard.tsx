import { ArrowRight, BellRing, CheckCircle2 } from "lucide-react"
import type { BusinessPortalState } from "@/domain/business-types"
import type { FitnessState } from "@/features/fitness/fitness-types"
import type { FumigationState } from "@/features/fumigation/fumigation-types"
import { fumigationStageLabel } from "@/features/fumigation/fumigation-shared"
import { formatFitnessReference } from "@/features/fitness/fitness-tracker-page"
import {
  getBusinessNextAction,
  getUrgentBusinessAlerts,
} from "@/domain/business-next-action"
import { validatePremises } from "@/domain/business-validation"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

function QuietLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Button
      variant="link"
      nativeButton={false}
      role="link"
      render={<a href={href} />}
      className="min-h-11 max-w-full justify-start px-0 text-left whitespace-normal"
    >
      {children}
      <ArrowRight data-icon="inline-end" aria-hidden="true" />
    </Button>
  )
}

function EmptySection({
  id,
  title,
  emptyTitle,
  description,
}: {
  id: string
  title: string
  emptyTitle: string
  description: string
}) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <h2 id={id} className="mb-3 font-semibold">
        {title}
      </h2>
      <Empty className="border px-5 py-6">
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  )
}

function Deadline({ value }: { value: string }) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return <span>Review notice for deadline</span>
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)}
    </time>
  )
}

export function BusinessDashboard({
  state,
  fitness = { handlers: [], application: null },
  fumigation = { application: null },
}: {
  state: BusinessPortalState
  fitness?: FitnessState
  fumigation?: FumigationState
}) {
  const { profile } = state
  const profileComplete = Boolean(
    profile?.verified &&
    state.stage === "complete" &&
    profile.premises &&
    Object.keys(validatePremises(profile.premises)).length === 0
  )
  const urgentAlerts = getUrgentBusinessAlerts(state.alerts)
  const fitnessApplication = fitness.application
  const fitnessIssued = fitnessApplication?.stage === "issued"
  const fitnessInProgress = Boolean(fitnessApplication && !fitnessIssued)
  const fumigationApplication = fumigation.application
  const fumigationIssued = fumigationApplication?.stage === "issued"
  const fumigationInProgress = Boolean(
    fumigationApplication && !fumigationIssued
  )
  const fumigationActionHref =
    fumigationApplication?.stage === "draft" ||
    fumigationApplication?.stage === "review"
      ? "/business/fumigation/apply"
      : "/business/fumigation/tracker"
  const fitnessActionHref =
    fitnessApplication?.stage === "draft" ||
    fitnessApplication?.stage === "review"
      ? "/business/fitness/apply"
      : "/business/fitness/tracker"
  const action = getBusinessNextAction({
    profileComplete,
    alerts: state.alerts,
    foodHandlerCount: fitness.handlers.length,
    fitness: fitnessIssued
      ? "active"
      : fitnessInProgress
        ? "in-progress"
        : "not-started",
    fitnessActionHref,
    fumigation: fumigationIssued
      ? "active"
      : fumigationInProgress
        ? "in-progress"
        : "not-started",
    fumigationActionHref,
    missingHealthApprovalRequirement: true,
  })
  const statuses = [
    {
      title: "Fitness",
      status: fitnessIssued
        ? "Issued"
        : fitnessInProgress
          ? fitnessApplication?.stage === "awaiting-facility"
            ? "Awaiting facility result"
            : "Application in progress"
          : "Not started",
      description: fitnessIssued
        ? "Your selected food handlers are covered by a Fitness Certificate."
        : fitnessInProgress
          ? "Track the assessment and council decision for your selected food handlers."
          : "Covers the food handlers at your premises. Add their records before beginning an assessment.",
      href: fitnessIssued
        ? "/business/fitness/certificate"
        : fitnessInProgress
          ? fitnessActionHref
          : "/business/food-handlers",
      label: fitnessIssued
        ? "View Fitness certificate"
        : fitnessInProgress
          ? "Track Fitness application"
          : "Manage food handlers",
    },
    {
      title: "Fumigation",
      status: fumigationApplication
        ? fumigationStageLabel[fumigationApplication.stage]
        : "Not started",
      description:
        "Covers fumigation of your premises by an approved provider.",
      href: fumigationIssued
        ? "/business/fumigation/certificate"
        : fumigationInProgress
          ? fumigationActionHref
          : "/business/fumigation/apply",
      label: fumigationIssued
        ? "View Fumigation Certificate"
        : fumigationInProgress
          ? "Track Fumigation application"
          : "Start Fumigation application",
    },
    {
      title: "Health Approval",
      status: "Requirements incomplete",
      description:
        "Requires valid Fitness and Fumigation Certificates, followed by eligibility checks and inspection.",
      href: "/business/certificates",
      label: "View Health Approval requirements",
    },
  ]
  return (
    <div className="flex min-w-0 flex-col gap-8 break-words">
      <PageHeader
        eyebrow="Business portal"
        title="Business dashboard"
        description="Your premises, certificate progress, and the next step to take."
      />
      <section
        aria-label="Business profile"
        className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start"
      >
        <div className="min-w-0">
          <p className="font-semibold">
            {profile?.businessName || "Your business"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.premises
              ? `${profile.premises.premisesName} · ${profile.premises.address}`
              : "Premises details still needed"}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 self-start">
          {profileComplete && <CheckCircle2 aria-hidden="true" />}{" "}
          {profileComplete ? "Profile complete" : "Profile incomplete"}
        </Badge>
      </section>
      {urgentAlerts.length > 0 && (
        <Alert variant="destructive">
          <BellRing aria-hidden="true" />
          <AlertTitle>
            {urgentAlerts.length} urgent{" "}
            {urgentAlerts.length === 1 ? "task needs" : "tasks need"} your
            attention
          </AlertTitle>
          <AlertDescription>
            Review inspection notices and corrective actions below to see what
            is due.
          </AlertDescription>
        </Alert>
      )}
      <section aria-labelledby="next-action-label">
        <Card>
          <CardHeader>
            <p
              id="next-action-label"
              className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase"
            >
              Next required action
            </p>
            <CardTitle>
              <h2>{action.title}</h2>
            </CardTitle>
            <CardDescription className="max-w-2xl">
              {action.description}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              nativeButton={false}
              role="link"
              render={<a href={action.href} />}
              className="min-h-11 max-w-full text-left whitespace-normal"
            >
              {action.label}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </CardFooter>
        </Card>
      </section>
      <section
        aria-labelledby="certificate-status"
        className="flex flex-col gap-4"
      >
        <h2 id="certificate-status" className="font-semibold">
          Certificate status
        </h2>
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {statuses.map((item) => (
            <Card key={item.title} size="sm" className="min-w-0">
              <CardHeader>
                <CardTitle>
                  <h3>{item.title}</h3>
                </CardTitle>
                <Badge variant="secondary" className="mt-2">
                  {item.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter>
                <QuietLink href={item.href}>{item.label}</QuietLink>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
      <div className="grid min-w-0 gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          {fitnessInProgress || fumigationInProgress ? (
            <section aria-labelledby="active-applications" className="min-w-0">
              <h2 id="active-applications" className="mb-3 font-semibold">
                Active applications
              </h2>
              <div className="space-y-3">
                {fitnessInProgress && (
                  <Card size="sm">
                    <CardHeader>
                      <CardTitle>Fitness application</CardTitle>
                      <CardDescription>
                        {fitnessApplication?.handlerIds.length} food handler(s)
                        ·{" "}
                        {fitnessApplication?.stage === "awaiting-facility"
                          ? "Awaiting facility result"
                          : fitnessApplication?.stage === "result-received"
                            ? "Facility result received"
                            : "Draft in progress"}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <QuietLink href={fitnessActionHref}>
                        Track Fitness application
                      </QuietLink>
                    </CardFooter>
                  </Card>
                )}
                {fumigationInProgress && (
                  <Card size="sm">
                    <CardHeader>
                      <CardTitle>Fumigation application</CardTitle>
                      <CardDescription>
                        {fumigationApplication
                          ? fumigationStageLabel[fumigationApplication.stage]
                          : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <QuietLink href={fumigationActionHref}>
                        Track Fumigation application
                      </QuietLink>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </section>
          ) : (
            <EmptySection
              id="active-applications"
              title="Active applications"
              emptyTitle="No active applications"
              description="Begin with Fitness for your food handlers and Fumigation for your premises. Application progress will appear here."
            />
          )}
          <QuietLink href="/business/applications">View applications</QuietLink>
        </div>
        <section aria-labelledby="reminders" className="min-w-0">
          <h2 id="reminders" className="mb-3 font-semibold">
            Reminders and deadlines
          </h2>
          {state.alerts.length ? (
            <ul className="flex flex-col divide-y rounded-lg border px-4">
              {[
                ...urgentAlerts,
                ...state.alerts.filter((alert) => !alert.urgent),
              ].map((alert) => (
                <li key={alert.id} className="flex min-w-0 flex-col gap-1 py-3">
                  <p className="font-medium">{alert.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={alert.urgent ? "destructive" : "outline"}>
                      {alert.kind === "inspection"
                        ? "Acknowledgement required"
                        : "Corrective action required"}
                    </Badge>
                    <span>
                      Due <Deadline value={alert.dueAt} />
                    </span>
                  </div>
                  <QuietLink href="/business/inspections">
                    {alert.kind === "inspection"
                      ? "View inspection notice"
                      : "View findings"}
                  </QuietLink>
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="border px-5 py-6">
              <EmptyHeader>
                <EmptyTitle>No reminders yet</EmptyTitle>
                <EmptyDescription>
                  Inspection deadlines and certificate renewal reminders will
                  appear here when available.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
        {fumigationApplication?.paymentReference ||
        fitnessApplication?.paymentReference ? (
          <section aria-labelledby="recent-receipts" className="min-w-0">
            <h2 id="recent-receipts" className="mb-3 font-semibold">
              Recent receipts
            </h2>
            <Card size="sm">
              <CardHeader>
                <CardTitle>
                  {fumigationApplication?.paymentReference
                    ? "Fumigation service"
                    : "Fitness assessment"}
                </CardTitle>
                <CardDescription>
                  {fumigationApplication?.paymentReference ??
                    formatFitnessReference(
                      fitnessApplication?.paymentReference ?? ""
                    )}{" "}
                  · No money moved
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <QuietLink
                  href={
                    fumigationApplication?.paymentReference
                      ? "/business/fumigation/tracker"
                      : "/business/fitness/tracker"
                  }
                >
                  View application
                </QuietLink>
              </CardFooter>
            </Card>
          </section>
        ) : (
          <EmptySection
            id="recent-receipts"
            title="Recent receipts"
            emptyTitle="No receipts yet"
            description="Receipts will appear after payments for certificate services. No payment is needed for account setup."
          />
        )}
        {fumigationApplication?.certificate ||
        fitnessApplication?.certificate ? (
          <section aria-labelledby="recent-certificates" className="min-w-0">
            <h2 id="recent-certificates" className="mb-3 font-semibold">
              Recent certificates
            </h2>
            <Card size="sm">
              <CardHeader>
                <CardTitle>
                  {fumigationApplication?.certificate
                    ? "Fumigation Certificate"
                    : "Fitness Certificate"}
                </CardTitle>
                <CardDescription>
                  {fumigationApplication?.certificate?.id ??
                    formatFitnessReference(
                      fitnessApplication?.certificate?.id ?? ""
                    )}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <QuietLink
                  href={
                    fumigationApplication?.certificate
                      ? "/business/fumigation/certificate"
                      : "/business/fitness/certificate"
                  }
                >
                  View certificate
                </QuietLink>
              </CardFooter>
            </Card>
          </section>
        ) : (
          <EmptySection
            id="recent-certificates"
            title="Recent certificates"
            emptyTitle="No certificates yet"
            description="Issued certificates will appear here after assessment and approval. Completing your profile does not issue a certificate."
          />
        )}
      </div>
      <nav
        aria-label="Business dashboard shortcuts"
        className="flex flex-wrap gap-x-6 gap-y-2"
      >
        <QuietLink href="/business/inspections">View inspections</QuietLink>
        <QuietLink href="/business/profile">Update business profile</QuietLink>
        <QuietLink href="/business/certificates">View certificates</QuietLink>
      </nav>
    </div>
  )
}
