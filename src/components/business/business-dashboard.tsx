import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileBadge2,
  ReceiptText,
  ShieldCheck,
  SprayCan,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { BusinessPortalState } from "@/domain/business-types"
import type { FitnessState } from "@/features/fitness/fitness-types"
import type { FumigationState } from "@/features/fumigation/fumigation-types"
import type { InspectionState } from "@/features/inspection/inspection-types"
import {
  certificateIsValid,
  certificateReminder,
  latestCertificateApplication,
} from "@/domain/certificate-validity"
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
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  icon: Icon,
}: {
  id: string
  title: string
  emptyTitle: string
  description: string
  icon: LucideIcon
}) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <h2 id={id} className="mb-3 font-semibold">
        {title}
      </h2>
      <Empty className="border px-5 py-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon aria-hidden="true" />
          </EmptyMedia>
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
  inspection = { inspection: null },
  premisesPhoto,
}: {
  state: BusinessPortalState
  fitness?: FitnessState
  fumigation?: FumigationState
  inspection?: InspectionState
  premisesPhoto?: string
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
  const fitnessIssuedApplication = latestCertificateApplication(
    fitnessApplication,
    fitness.history
  )
  const fitnessCertificate = fitnessIssuedApplication?.certificate
  const fitnessIssued = fitnessCertificate
    ? certificateIsValid(fitnessCertificate.expiresAt)
    : fitnessApplication?.stage === "issued"
  const fitnessExpired = Boolean(fitnessCertificate && !fitnessIssued)
  const fitnessInProgress = Boolean(
    fitnessApplication && fitnessApplication.stage !== "issued"
  )
  const fitnessRenewing = Boolean(
    fitness.history?.length &&
    fitnessApplication?.stage !== "issued" &&
    fitnessApplication?.purpose !== "new-staff"
  )
  const fumigationApplication = fumigation.application
  const fumigationIssuedApplication = latestCertificateApplication(
    fumigationApplication,
    fumigation.history
  )
  const fumigationCertificate = fumigationIssuedApplication?.certificate
  const fumigationIssued = fumigationCertificate
    ? certificateIsValid(fumigationCertificate.expiresAt)
    : fumigationApplication?.stage === "issued"
  const fumigationExpired = Boolean(fumigationCertificate && !fumigationIssued)
  const fumigationInProgress = Boolean(
    fumigationApplication && fumigationApplication.stage !== "issued"
  )
  const fumigationRenewing = Boolean(
    fumigation.history?.length && fumigationApplication?.stage !== "issued"
  )
  const fitnessReminder = fitnessCertificate
    ? certificateReminder(
        fitnessCertificate.expiresAt,
        new Date(),
        fitnessRenewing
      )
    : null
  const fumigationReminder = fumigationCertificate
    ? certificateReminder(
        fumigationCertificate.expiresAt,
        new Date(),
        fumigationRenewing
      )
    : null
  const recentFitnessPayment =
    fitnessApplication?.paymentReference ??
    [...(fitness.history ?? [])].reverse().find((item) => item.paymentReference)
      ?.paymentReference
  const recentFumigationPayment =
    fumigationApplication?.paymentReference ??
    [...(fumigation.history ?? [])]
      .reverse()
      .find((item) => item.paymentReference)?.paymentReference
  const inspectionCase = inspection.inspection
  const healthEligible = fitnessIssued && fumigationIssued
  const healthStage = healthEligible
    ? (inspectionCase?.stage ?? "eligible")
    : undefined
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
    fitness: fitnessInProgress
      ? "in-progress"
      : fitnessIssued
        ? "active"
        : fitnessExpired
          ? "expired"
          : "not-started",
    fitnessActionHref,
    fumigation: fumigationInProgress
      ? "in-progress"
      : fumigationIssued
        ? "active"
        : fumigationExpired
          ? "expired"
          : "not-started",
    fumigationActionHref,
    missingHealthApprovalRequirement: !healthEligible,
    healthApprovalStage: healthStage,
  })
  const statuses = [
    {
      title: "Fitness",
      icon: Users,
      status: fitnessRenewing
        ? "Renewal in progress"
        : fitnessExpired
          ? "Expired"
          : fitnessIssued
            ? "Issued"
            : fitnessInProgress
              ? fitnessApplication?.stage === "awaiting-facility"
                ? "Awaiting facility result"
                : "Application in progress"
              : "Not started",
      description: fitnessRenewing
        ? "Previous certificate saved in history."
        : fitnessExpired
          ? "Renew to restore coverage."
          : fitnessIssued
            ? "Food handlers covered."
            : fitnessInProgress
              ? "Assessment and council decision pending."
              : "Add food handlers to begin.",
      href: fitnessRenewing
        ? fitnessActionHref
        : fitnessExpired || fitnessIssued
          ? "/business/fitness/certificate"
          : fitnessInProgress
            ? fitnessActionHref
            : "/business/food-handlers",
      label: fitnessRenewing
        ? "Track Fitness renewal"
        : fitnessExpired
          ? "Renew Fitness certificate"
          : fitnessIssued
            ? "View Fitness certificate"
            : fitnessInProgress
              ? "Track Fitness application"
              : "Manage food handlers",
    },
    {
      title: "Fumigation",
      icon: SprayCan,
      status: fumigationRenewing
        ? "Renewal in progress"
        : fumigationExpired
          ? "Expired"
          : fumigationApplication
            ? fumigationStageLabel[fumigationApplication.stage]
            : "Not started",
      description: "Premises treatment by an approved provider.",
      href: fumigationRenewing
        ? fumigationActionHref
        : fumigationExpired || fumigationIssued
          ? "/business/fumigation/certificate"
          : fumigationInProgress
            ? fumigationActionHref
            : "/business/fumigation/apply",
      label: fumigationRenewing
        ? "Track Fumigation renewal"
        : fumigationExpired
          ? "Renew Fumigation Certificate"
          : fumigationIssued
            ? "View Fumigation Certificate"
            : fumigationInProgress
              ? "Track Fumigation application"
              : "Start Fumigation application",
    },
    {
      title: "Health Approval",
      icon: ShieldCheck,
      status: !healthEligible
        ? "Requirements incomplete"
        : inspectionCase?.stage === "approval-issued"
          ? "Issued"
          : inspectionCase?.stage === "further-action"
            ? "Further action required"
            : inspectionCase?.stage === "findings-issued"
              ? "Corrective action required"
              : inspectionCase?.stage === "follow-up-served" ||
                  inspectionCase?.stage === "follow-up-acknowledged"
                ? "Follow-up inspection pending"
                : inspectionCase?.stage === "notice-served"
                  ? "Acknowledgement required"
                  : "Inspection pending",
      description: !healthEligible
        ? "Fitness and Fumigation required first."
        : inspectionCase?.stage === "approval-issued"
          ? "Approval available for these premises."
          : "Track inspection and council decision.",
      href: "/business/health-approval",
      label: healthEligible
        ? "View Health Approval"
        : "View Health Approval requirements",
    },
  ]
  return (
    <div className="flex min-w-0 flex-col gap-8 break-words">
      <PageHeader eyebrow="Business portal" title="Business dashboard" />
      <section
        aria-label="Business profile"
        className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start"
      >
        <div className="flex min-w-0 items-center gap-4">
          {premisesPhoto && (
            <img
              src={premisesPhoto}
              alt={`${profile?.premises?.premisesName ?? "Business"} premises`}
              className="size-16 shrink-0 rounded-md object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold">
              {profile?.businessName || "Your business"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.premises
                ? `${profile.premises.premisesName} · ${profile.premises.address}`
                : "Premises details still needed"}
            </p>
            <QuietLink href="/business/settings">
              Update business profile
            </QuietLink>
          </div>
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
            Check deadlines in the Activity tab.
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
      <Tabs defaultValue="overview" className="min-w-0 gap-6">
        <div className="w-full overflow-x-auto border-b">
          <TabsList
            variant="line"
            aria-label="Dashboard sections"
            className="h-11! min-w-max! justify-start gap-1 rounded-none p-0"
          >
            {[
              ["overview", "Overview"],
              ["activity", "Activity"],
              ["records", "Records"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="min-h-11 flex-none rounded-none border-b-2 border-b-transparent px-4 transition-none after:hidden data-active:border-b-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="overview">
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
                      <h3 className="flex items-center gap-2">
                        <item.icon
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {item.title}
                      </h3>
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
        </TabsContent>
        <TabsContent value="activity">
          <div className="grid min-w-0 gap-8 lg:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              {fitnessInProgress || fumigationInProgress ? (
                <section
                  aria-labelledby="active-applications"
                  className="min-w-0"
                >
                  <h2 id="active-applications" className="mb-3 font-semibold">
                    Active applications
                  </h2>
                  <div className="space-y-3">
                    {fitnessInProgress && (
                      <Card size="sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Users
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                            Fitness application
                          </CardTitle>
                          <CardDescription>
                            {fitnessApplication?.handlerIds.length} food
                            handler(s) ·{" "}
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
                          <CardTitle className="flex items-center gap-2">
                            <SprayCan
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                            Fumigation application
                          </CardTitle>
                          <CardDescription>
                            {fumigationApplication
                              ? fumigationStageLabel[
                                  fumigationApplication.stage
                                ]
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
                  description="Start Fitness or Fumigation when ready."
                  icon={ClipboardList}
                />
              )}
              <QuietLink href="/business/applications">
                View applications
              </QuietLink>
            </div>
            <section aria-labelledby="reminders" className="min-w-0">
              <h2 id="reminders" className="mb-3 font-semibold">
                Reminders and deadlines
              </h2>
              {state.alerts.length || fitnessReminder || fumigationReminder ? (
                <ul className="flex flex-col divide-y rounded-lg border px-4">
                  {fitnessReminder && (
                    <li className="py-3">
                      <p className="flex items-center gap-2 font-medium">
                        <CalendarClock
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        Fitness Certificate
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {fitnessReminder}
                      </p>
                      <QuietLink href="/business/fitness/certificate">
                        View certificate
                      </QuietLink>
                    </li>
                  )}
                  {fumigationReminder && (
                    <li className="py-3">
                      <p className="flex items-center gap-2 font-medium">
                        <CalendarClock
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        Fumigation Certificate
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {fumigationReminder}
                      </p>
                      <QuietLink href="/business/fumigation/certificate">
                        View certificate
                      </QuietLink>
                    </li>
                  )}
                  {[
                    ...urgentAlerts,
                    ...state.alerts.filter((alert) => !alert.urgent),
                  ].map((alert) => (
                    <li
                      key={alert.id}
                      className="flex min-w-0 flex-col gap-1 py-3"
                    >
                      <p className="flex items-center gap-2 font-medium">
                        <BellRing
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        {alert.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge
                          variant={alert.urgent ? "destructive" : "outline"}
                        >
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
                    <EmptyMedia variant="icon">
                      <CalendarClock aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>No reminders yet</EmptyTitle>
                    <EmptyDescription>
                      Deadlines and renewals will appear here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </section>
          </div>
        </TabsContent>
        <TabsContent value="records">
          <div className="grid min-w-0 gap-8 lg:grid-cols-2">
            {recentFumigationPayment || recentFitnessPayment ? (
              <section aria-labelledby="recent-receipts" className="min-w-0">
                <h2 id="recent-receipts" className="mb-3 font-semibold">
                  Recent receipts
                </h2>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ReceiptText
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {recentFumigationPayment
                        ? "Fumigation service"
                        : "Fitness assessment"}
                    </CardTitle>
                    <CardDescription>
                      {recentFumigationPayment ??
                        formatFitnessReference(recentFitnessPayment ?? "")}{" "}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <QuietLink href="/business/applications">
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
                description="Payment records will appear here."
                icon={ReceiptText}
              />
            )}
            {fumigationCertificate || fitnessCertificate ? (
              <section
                aria-labelledby="recent-certificates"
                className="min-w-0"
              >
                <h2 id="recent-certificates" className="mb-3 font-semibold">
                  Recent certificates
                </h2>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileBadge2
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      {fumigationCertificate
                        ? "Fumigation Certificate"
                        : "Fitness Certificate"}
                    </CardTitle>
                    <CardDescription>
                      {fumigationCertificate?.id ??
                        formatFitnessReference(fitnessCertificate?.id ?? "")}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <QuietLink
                      href={
                        fumigationCertificate
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
                description="Issued certificates will appear here."
                icon={FileBadge2}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
