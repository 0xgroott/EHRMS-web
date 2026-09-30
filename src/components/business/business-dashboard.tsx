import { useState } from "react"
import {
  ArrowRight,
  BellRing,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileBadge2,
  ShieldCheck,
  SprayCan,
  Users,
} from "lucide-react"
import type { BusinessPortalState } from "@/domain/business-types"
import type { FitnessState } from "@/features/fitness/fitness-types"
import type { FumigationState } from "@/features/fumigation/fumigation-types"
import type {
  InspectionStage,
  InspectionState,
} from "@/features/inspection/inspection-types"
import {
  certificateIsValid,
  latestCertificateApplication,
} from "@/domain/certificate-validity"
import { formatFitnessReference } from "@/features/fitness/fitness-tracker-page"
import { fitnessTestStatus } from "@/features/fitness/fitness-test-status"
import { getUrgentBusinessAlerts } from "@/domain/business-next-action"
import { validatePremises } from "@/domain/business-validation"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const STAFF_PAGE_SIZE = 10

const HEALTH_APPROVAL_STATUS: Record<InspectionStage, string> = {
  "notice-served": "Inspection notice received",
  "notice-acknowledged": "Inspection scheduled",
  "findings-issued": "Corrective actions required",
  "corrections-recorded": "Corrections recorded",
  "follow-up-served": "Follow-up notice received",
  "follow-up-acknowledged": "Follow-up inspection scheduled",
  resolved: "Awaiting council decision",
  "approval-issued": "Health Approval issued",
  "further-action": "Further action required",
}

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

function DashboardDate({ value }: { value: string }) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <span>Date unavailable</span>
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
  businessAvatar,
}: {
  state: BusinessPortalState
  fitness?: FitnessState
  fumigation?: FumigationState
  inspection?: InspectionState
  businessAvatar?: string
}) {
  const [staffPage, setStaffPage] = useState(1)
  const [dashboardTab, setDashboardTab] = useState("staff")
  const { profile } = state
  const businessInitials = (profile?.businessName ?? "Business")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
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
  const issuedCertificateCount =
    Number(fitnessIssued) + Number(fumigationIssued)
  const activeStaffCount = fitness.handlers.filter(
    (handler) => !handler.archivedAt
  ).length
  const staffPageCount = Math.max(
    1,
    Math.ceil(fitness.handlers.length / STAFF_PAGE_SIZE)
  )
  const currentStaffPage = Math.min(staffPage, staffPageCount)
  const visibleStaff = fitness.handlers.slice(
    (currentStaffPage - 1) * STAFF_PAGE_SIZE,
    currentStaffPage * STAFF_PAGE_SIZE
  )
  const hasStartedCertificateProcess = Boolean(
    fitnessApplication ||
    fitness.history?.length ||
    fumigationApplication ||
    fumigation.history?.length
  )
  const fitnessChoice = fitnessExpired
    ? {
        status: "Expired",
        label: "Renew Health Fitness Certificate",
        href: "/business/fitness/certificate",
      }
    : fitnessIssued
      ? {
          status: "Issued",
          label: "View Health Fitness Certificate",
          href: "/business/fitness/certificate",
        }
      : fitnessInProgress
        ? {
            status: "Application in progress",
            label: "Continue Health Fitness Certificate",
            href: fitnessActionHref,
          }
        : fitness.handlers.length === 0
          ? {
              status: "Kitchen staff required",
              label: "Add kitchen staff",
              href: "/business/food-handlers",
            }
          : {
              status: "Ready to begin",
              label: "Begin Health Fitness Certificate",
              href: "/business/fitness/apply",
            }
  const fumigationChoice = fumigationExpired
    ? {
        status: "Expired",
        label: "Renew Fumigation Certificate",
        href: "/business/fumigation/certificate",
      }
    : fumigationIssued
      ? {
          status: "Issued",
          label: "View Fumigation Certificate",
          href: "/business/fumigation/certificate",
        }
      : fumigationInProgress
        ? {
            status: "Application in progress",
            label: "Continue Fumigation Certificate",
            href: fumigationActionHref,
          }
        : {
            status: "Ready to begin",
            label: "Begin Fumigation Certificate",
            href: "/business/fumigation/apply",
          }
  const certificateRows = [
    ...(fitnessCertificate
      ? [
          {
            name: "Health Fitness Certificate",
            reference: formatFitnessReference(fitnessCertificate.id),
            status: fitnessExpired ? "Expired" : "Issued",
            href: "/business/fitness/certificate",
            action: "View certificate",
          },
        ]
      : fitnessInProgress
        ? [
            {
              name: "Health Fitness Certificate",
              reference: fitnessApplication?.id ?? "—",
              status: "In progress",
              href: "/business/fitness/tracker",
              action: "View status",
            },
          ]
        : []),
    ...(fumigationCertificate
      ? [
          {
            name: "Fumigation Certificate",
            reference: fumigationCertificate.id,
            status: fumigationExpired ? "Expired" : "Issued",
            href: "/business/fumigation/certificate",
            action: "View certificate",
          },
        ]
      : fumigationInProgress
        ? [
            {
              name: "Fumigation Certificate",
              reference: fumigationApplication?.id ?? "—",
              status: "In progress",
              href: "/business/fumigation/tracker",
              action: "View status",
            },
          ]
        : []),
  ]
  const activityByKey = new Map<
    string,
    { date: string; activity: string; reference: string }
  >()
  for (const application of [
    ...(fitness.history ?? []),
    ...(fitness.application ? [fitness.application] : []),
  ]) {
    if (application.certificate) {
      activityByKey.set(`fitness-${application.certificate.id}`, {
        date: application.certificate.issuedAt,
        activity: "Fitness Certificate issued",
        reference: formatFitnessReference(application.certificate.id),
      })
    }
  }
  for (const application of [
    ...(fumigation.history ?? []),
    ...(fumigation.application ? [fumigation.application] : []),
  ]) {
    if (application.certificate) {
      activityByKey.set(`fumigation-${application.certificate.id}`, {
        date: application.certificate.issuedAt,
        activity: "Fumigation Certificate issued",
        reference: application.certificate.id,
      })
    }
  }
  const inspectionCase = inspection.inspection
  const showHealthApprovalCard = Boolean(
    (fitnessIssued && fumigationIssued) || inspectionCase
  )
  const healthApprovalIssued = Boolean(
    inspectionCase?.certificate &&
    certificateIsValid(inspectionCase.certificate.expiresAt)
  )
  const healthApprovalStatus =
    inspectionCase?.certificate && !healthApprovalIssued
      ? "Health Approval expired"
      : inspectionCase
        ? HEALTH_APPROVAL_STATUS[inspectionCase.stage]
        : "Awaiting inspection notice"
  if (inspectionCase?.notice.acknowledgedAt) {
    activityByKey.set(`inspection-${inspectionCase.notice.reference}`, {
      date: inspectionCase.notice.acknowledgedAt,
      activity: "Inspection notice acknowledged",
      reference: inspectionCase.notice.reference,
    })
  }
  if (inspectionCase?.followUpNotice?.acknowledgedAt) {
    activityByKey.set(`follow-up-${inspectionCase.followUpNotice.reference}`, {
      date: inspectionCase.followUpNotice.acknowledgedAt,
      activity: "Follow-up inspection acknowledged",
      reference: inspectionCase.followUpNotice.reference,
    })
  }
  if (inspectionCase?.certificate) {
    activityByKey.set(`approval-${inspectionCase.certificate.id}`, {
      date: inspectionCase.certificate.issuedAt,
      activity: "Health Approval issued",
      reference: inspectionCase.certificate.id,
    })
  }
  const recentActivity = [...activityByKey.values()].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date)
  )
  return (
    <div className="flex min-w-0 flex-col gap-8 break-words">
      <PageHeader eyebrow="Business portal" title="Home" />
      {urgentAlerts.length > 0 && (
        <Alert variant="destructive">
          <BellRing aria-hidden="true" />
          <AlertTitle>
            {urgentAlerts.length} urgent{" "}
            {urgentAlerts.length === 1 ? "task needs" : "tasks need"} your
            attention
          </AlertTitle>
          <AlertDescription>
            Review your inspection tasks as soon as possible.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <Card aria-label="Business profile" className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Your business</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16">
                {businessAvatar && (
                  <AvatarImage
                    src={businessAvatar}
                    alt={`${profile?.businessName ?? "Business"} logo`}
                    keepMounted
                  />
                )}
                <AvatarFallback className="text-base font-semibold text-primary">
                  {businessInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-lg font-semibold">
                  {profile?.businessName || "Your business"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm leading-6 text-muted-foreground">
                  {profileComplete && (
                    <CheckCircle2
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                  )}
                  {profileComplete ? "Profile complete" : "Profile incomplete"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <QuietLink
              href={
                profileComplete
                  ? "/business/settings"
                  : "/business/settings#kyb"
              }
            >
              View profile
            </QuietLink>
          </CardFooter>
        </Card>
        <Card className="relative min-w-0 overflow-hidden bg-primary text-primary-foreground ring-primary/20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-8 size-44 rounded-full border border-primary-foreground/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-8 -right-12 size-52 rounded-full border border-primary-foreground/10"
          />
          <CardHeader className="relative">
            <CardTitle className="text-primary-foreground">
              <h2>
                {showHealthApprovalCard
                  ? "My Health Approval"
                  : "Complete your certificates"}
              </h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex-row items-end justify-between gap-6">
            <div className="flex max-w-sm flex-col items-start gap-4">
              {showHealthApprovalCard ? (
                <>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-primary-foreground/70 uppercase">
                      Current status
                    </p>
                    <p className="mt-1 font-semibold">{healthApprovalStatus}</p>
                    <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
                      {inspectionCase
                        ? "Follow your inspection and approval progress."
                        : "Both certificate requirements are complete. Your inspection status will appear here."}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    nativeButton={false}
                    role="link"
                    render={<a href="/business/health-approval" />}
                    className="min-h-11"
                  >
                    {healthApprovalIssued
                      ? "View Health Approval"
                      : "View status"}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm leading-6 text-primary-foreground/75">
                    Begin or continue the requirements for your premises.
                  </p>
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="secondary"
                          size="lg"
                          className="min-h-11"
                        />
                      }
                    >
                      {hasStartedCertificateProcess
                        ? "Continue process"
                        : "Get started"}
                      <ArrowRight data-icon="inline-end" aria-hidden="true" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Choose a certificate</DialogTitle>
                        <DialogDescription>
                          Select the requirement you want to begin or continue.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-3">
                        {[
                          {
                            title: "Health Fitness Certificate",
                            description:
                              "Health assessment for your kitchen staff.",
                            icon: Users,
                            ...fitnessChoice,
                          },
                          {
                            title: "Fumigation Certificate",
                            description:
                              "Treatment and certification for your premises.",
                            icon: SprayCan,
                            ...fumigationChoice,
                          },
                        ].map((choice) => (
                          <Button
                            key={choice.title}
                            variant="outline"
                            nativeButton={false}
                            role="link"
                            aria-label={`${choice.label}. ${choice.status}`}
                            render={<a href={choice.href} />}
                            className="h-auto min-h-20 w-full justify-start gap-3 px-4 py-3 text-left whitespace-normal"
                          >
                            <choice.icon
                              data-icon="inline-start"
                              aria-hidden="true"
                            />
                            <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                              <span className="font-semibold">
                                {choice.title}
                              </span>
                              <span className="text-xs font-normal text-muted-foreground">
                                {choice.description}
                              </span>
                            </span>
                            <Badge variant="secondary">{choice.status}</Badge>
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
            <div
              aria-hidden="true"
              className="relative hidden size-24 shrink-0 place-items-center sm:grid"
            >
              <div className="absolute inset-2 rotate-6 rounded-xl bg-primary-foreground/15" />
              <div className="relative grid size-20 place-items-center rounded-xl bg-primary-foreground text-primary shadow-sm">
                {showHealthApprovalCard ? (
                  <ShieldCheck className="size-9" />
                ) : (
                  <FileBadge2 className="size-9" />
                )}
                <span className="absolute -right-2 -bottom-2 grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                  <ShieldCheck className="size-4" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <section
        aria-label="Business metrics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Card size="sm">
          <CardHeader>
            <CardTitle>Kitchen staff</CardTitle>
            <CardDescription>Registered for this premises</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {activeStaffCount}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Branches</CardTitle>
            <CardDescription>Registered business locations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {profile?.premises ? 1 : 0}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Certificates issued</CardTitle>
            <CardDescription>Health Fitness and Fumigation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {issuedCertificateCount}
            </p>
          </CardContent>
        </Card>
      </section>
      <Tabs
        value={dashboardTab}
        onValueChange={setDashboardTab}
        className="min-w-0 gap-6"
      >
        <div className="flex w-full items-center gap-4 overflow-x-auto border-b">
          <TabsList
            variant="line"
            aria-label="Dashboard sections"
            className="h-11! min-w-max! justify-start gap-1 rounded-none p-0"
          >
            {[
              ["staff", "Staff"],
              ["certificates", "Certificates"],
              ["activity", "Activity"],
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
          {dashboardTab === "staff" && (
            <div className="ml-auto shrink-0 pr-1">
              <QuietLink href="/business/food-handlers">
                View all staff
              </QuietLink>
            </div>
          )}
        </div>
        <TabsContent value="staff">
          <section aria-label="Staff" className="min-w-0">
            {visibleStaff.length === 0 ? (
              <div className="rounded-lg border border-dashed px-5 py-8 text-center">
                <p className="font-medium">No staff registered yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add staff before starting a Health Fitness Certificate.
                </p>
              </div>
            ) : (
              <Table
                aria-label="Dashboard staff list"
                className="min-w-[38rem]"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Job role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fitness test</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleStaff.map((handler) => (
                    <TableRow key={handler.id}>
                      <TableCell className="font-medium">
                        {handler.fullName}
                      </TableCell>
                      <TableCell>{handler.role || "Not recorded"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={handler.archivedAt ? "outline" : "secondary"}
                        >
                          {handler.archivedAt ? "Archived" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fitnessTestStatus(fitness, handler.id)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {fitness.handlers.length > STAFF_PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Page {currentStaffPage} of {staffPageCount}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous page"
                    disabled={currentStaffPage === 1}
                    onClick={() =>
                      setStaffPage((page) => Math.max(1, page - 1))
                    }
                  >
                    <ChevronLeft aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next page"
                    disabled={currentStaffPage === staffPageCount}
                    onClick={() =>
                      setStaffPage((page) => Math.min(staffPageCount, page + 1))
                    }
                  >
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </section>
        </TabsContent>
        <TabsContent value="certificates">
          <section aria-label="Certificates" className="min-w-0">
            {certificateRows.length === 0 ? (
              <div className="rounded-lg border border-dashed px-5 py-8 text-center">
                <p className="font-medium">No certificates yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your certificate applications and issued documents will appear
                  here.
                </p>
              </div>
            ) : (
              <Table aria-label="Certificates" className="min-w-[40rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificateRows.map((certificate) => (
                    <TableRow key={certificate.name}>
                      <TableCell className="font-medium">
                        {certificate.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {certificate.reference}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            certificate.status === "Expired"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {certificate.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <QuietLink href={certificate.href}>
                          {certificate.action}
                        </QuietLink>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </TabsContent>
        <TabsContent value="activity">
          <section aria-label="Activity" className="min-w-0">
            {recentActivity.length === 0 ? (
              <div className="rounded-lg border border-dashed px-5 py-8 text-center">
                <p className="font-medium">No recent activity</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Certificate and inspection updates will appear here.
                </p>
              </div>
            ) : (
              <Table aria-label="Recent activity" className="min-w-[36rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((item) => (
                    <TableRow key={`${item.activity}-${item.reference}`}>
                      <TableCell>
                        <DashboardDate value={item.date} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.activity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
