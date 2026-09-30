import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  FileBadge2,
  FileText,
  Inbox,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRoundCheck,
  WifiOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { ScrollableTabsList } from "@/components/shared/scrollable-tabs-list"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { notifySuccess } from "@/components/ui/app-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { assignments, officers } from "./eho-model"
import type { Assignment, Fieldwork } from "./eho-model"
import { accountError, createDraft, signInOfficer } from "./eho-state"
import {
  followUpScenarios,
  followUpStorageKey,
  readFollowUp,
} from "./eho-follow-up"
import { saveRecentPremises } from "./eho-premises-search"
import { EhoCertificateDetail } from "./eho-certificate-detail"
import { inspectionHistory } from "./eho-inspection-history"
import { EhoInspectionHistoryPanel } from "./eho-inspection-history-panel"
import { EhoPaperCertificatePanel } from "./eho-paper-certificate-panel"
import { capturedPremisesFindings } from "./eho-premises-findings"
import { EhoPremisesFindingsPanel } from "./eho-premises-findings-panel"
import { EhoPremisesAvatar } from "./eho-premises-avatar"
import {
  acknowledgeInspectionNotice,
  completeTask,
  createTaskProgress,
  earliestAppointmentDate,
  nextTaskAction,
  readTaskProgress,
  resetTaskProgress,
  saveTaskProgress,
  scheduleAppointment,
  sendInspectionNotice,
  startFollowUp,
} from "./eho-task-progress"
import type { InspectionTaskProgress } from "./eho-task-progress"
import { useEho } from "./eho-session"

function premisesFor(assignment: Assignment) {
  return seedDatabase.premises.find(
    (premises) => premises.id === assignment.premisesId
  )
}

export function EhoSignInForm({
  onSuccess,
}: {
  onSuccess: (officerId: string) => void
}) {
  const [contact, setContact] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!contact.trim() || !password) {
      setError("Enter your staff ID or email and password.")
      return
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError("Connect to the internet for your first sign-in.")
      return
    }
    const officer = signInOfficer(contact, password)
    if (!officer) {
      setError(accountError(contact, password))
      return
    }
    setError("")
    onSuccess(officer.id)
  }
  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <label htmlFor="eho-contact" className="text-sm font-medium">
          Staff ID or email
        </label>
        <Input
          id="eho-contact"
          autoComplete="username"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          className="min-h-11"
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="eho-password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="eho-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-11"
          required
        />
      </div>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="min-h-11 w-full">
        Sign in
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full"
        onClick={() => {
          setContact("EHO-001")
          setPassword("field-demo")
          setError("")
        }}
      >
        Use assigned account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Need access or forgot your password? Contact your council administrator.
      </p>
    </form>
  )
}

export function EhoSignInPage() {
  const session = useEho()
  return (
    <main className="min-h-svh bg-background md:grid md:grid-cols-[minmax(18rem,.85fr)_minmax(0,1.15fr)]">
      <section className="flex flex-col bg-primary p-6 text-primary-foreground md:p-12 lg:p-16">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-7" aria-hidden="true" />
          <div>
            <strong className="block text-lg">EHRCMS</strong>
            <span className="text-sm">Field officer portal</span>
          </div>
        </div>
        <div className="hidden max-w-sm flex-1 flex-col justify-center gap-5 md:flex">
          <h2 className="text-3xl font-semibold tracking-tight">
            Your assigned work, ready for the field.
          </h2>
          <p className="leading-relaxed">
            Review the notice, capture findings, and save progress as you go.
          </p>
        </div>
        <p className="hidden text-xs md:block">
          Environmental Health Regulatory Case Management System
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md space-y-7">
          <header className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Assigned account
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in as an EHO
            </h1>
            <p className="text-sm text-muted-foreground">
              Use the account provided by your council administrator.
            </p>
          </header>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Choose another account type
          </Link>
          {session.error && (
            <Alert variant="destructive">
              <AlertDescription>{session.error}</AlertDescription>
            </Alert>
          )}
          <EhoSignInForm
            onSuccess={(id) => {
              const officer = officers.find((person) => person.id === id)
              if (officer && session.signIn(officer))
                window.location.assign("/eho/my-work")
            }}
          />
          <div className="flex items-center gap-2 rounded-md border p-3 text-xs text-muted-foreground">
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            First sign-in needs connectivity. Saved fieldwork remains on this
            device.
          </div>
        </div>
      </section>
    </main>
  )
}

function WorkMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <Card size="sm" className="min-h-28">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardAction>
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent className="mt-auto">
        <strong className="text-3xl font-semibold tabular-nums">{value}</strong>
      </CardContent>
    </Card>
  )
}

function assignmentSearchText(assignment: Assignment) {
  const premises = premisesFor(assignment)
  return `${assignment.id} ${assignment.type} ${premises?.businessName ?? ""} ${premises?.address ?? ""}`.toLowerCase()
}

function formatInspectionDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`))
}

function isOverdue(date: string) {
  return date < new Date().toISOString().slice(0, 10)
}

function draftStatus(draft: Fieldwork, scheduledAt: string) {
  const state =
    draft.status === "queued" ? (
      <Badge variant="warning">Waiting to sync</Badge>
    ) : draft.status === "submitted" ? (
      <Badge variant="success">Completed</Badge>
    ) : Object.keys(draft.answers).length ? (
      <Badge variant="warning">In progress</Badge>
    ) : (
      <Badge variant="secondary">Assigned</Badge>
    )
  return (
    <div className="flex flex-wrap gap-2">
      {state}
      {draft.status === "draft" && isOverdue(scheduledAt) && (
        <Badge variant="destructive">Overdue</Badge>
      )}
    </div>
  )
}

function JobTable({
  label,
  assignments: rows,
  emptyTitle,
  status,
  action,
  scheduledAt = (assignment) => assignment.scheduledAt,
  additionalSearchText = () => "",
}: {
  label: string
  assignments: Assignment[]
  emptyTitle: string
  status: (assignment: Assignment) => React.ReactNode
  action: (assignment: Assignment) => React.ReactNode
  scheduledAt?: (assignment: Assignment) => string
  additionalSearchText?: (assignment: Assignment) => string
}) {
  const [query, setQuery] = useState("")
  const filteredRows = rows.filter((assignment) =>
    `${assignmentSearchText(assignment)} ${additionalSearchText(assignment).toLowerCase()}`.includes(
      query.trim().toLowerCase()
    )
  )

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Input
        type="search"
        aria-label={`Search ${label}`}
        placeholder="Search by premises, address or reference"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="min-h-11 max-w-md"
      />
      {filteredRows.length ? (
        <div className="overflow-hidden rounded-xl border bg-background">
          <Table className="min-w-3xl">
            <TableCaption className="sr-only">{label} inspections</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Premises</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((assignment) => {
                const premises = premisesFor(assignment)
                return (
                  <TableRow key={assignment.id}>
                    <TableCell className="min-w-52 whitespace-normal">
                      <div className="flex items-center gap-3">
                        <EhoPremisesAvatar
                          name={
                            premises?.businessName ?? "Premises unavailable"
                          }
                        />
                        <div className="min-w-0">
                          <span className="block font-medium">
                            {premises?.businessName ?? "Premises unavailable"}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {premises?.address ?? "Address unavailable"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-52 whitespace-normal">
                      <span className="block font-medium">
                        Premises inspection
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatInspectionDate(scheduledAt(assignment))}
                    </TableCell>
                    <TableCell>{status(assignment)}</TableCell>
                    <TableCell className="text-right">
                      {action(assignment)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title={query ? "No jobs match your search" : emptyTitle}
          description={
            query
              ? "Try a premises name, address or job reference."
              : "New work will appear here when it is available."
          }
        />
      )}
    </div>
  )
}

export function EhoMyWorkPage() {
  const { fieldwork, officer } = useEho()
  const [followUpStatus, setFollowUpStatus] = useState<Record<string, string>>(
    {}
  )
  useEffect(() => {
    if (!officer) return
    setFollowUpStatus(
      Object.fromEntries(
        Object.keys(followUpScenarios).map((id) => [
          id,
          readFollowUp(localStorage, officer.id, id).status,
        ])
      )
    )
  }, [officer])
  const open = assignments.filter((assignment) => !fieldwork[assignment.id])
  const assigned = assignments.filter(
    (assignment) => fieldwork[assignment.id]?.status === "draft"
  )
  const completed = assignments.filter((assignment) =>
    ["submitted", "queued"].includes(fieldwork[assignment.id]?.status ?? "")
  )
  const followUps = assignments.filter(
    (assignment) =>
      followUpScenarios[assignment.id]?.notice === "Served" &&
      fieldwork[assignment.id]?.status === "submitted" &&
      (fieldwork[assignment.id]?.issues.length ?? 0) > 0
  )
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${officer?.name.split(" ")[0] ?? "officer"}.`}
        description="Claim available inspections, continue your drafts, and review completed fieldwork."
        divided={false}
        actions={
          <Button nativeButton={false} render={<Link to="/eho/inspections" />}>
            Browse open jobs{" "}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <WorkMetric label="Open" value={open.length} icon={Inbox} />
        <WorkMetric
          label="Assigned"
          value={assigned.length}
          icon={UserRoundCheck}
        />
        <WorkMetric
          label="Completed"
          value={completed.length}
          icon={CheckCircle2}
        />
        <WorkMetric
          label="Follow-up"
          value={followUps.length}
          icon={RotateCcw}
        />
      </div>
      <Tabs defaultValue="my-jobs" className="gap-4">
        <ScrollableTabsList>
          <TabsTrigger
            value="my-jobs"
            aria-label="My Jobs"
            className="min-h-11 flex-none gap-2 px-0"
          >
            My Jobs
            <Badge variant="secondary">{assigned.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="follow-ups"
            aria-label="Follow-up"
            className="min-h-11 flex-none gap-2 px-0"
          >
            Follow-up
            <Badge variant="secondary">{followUps.length}</Badge>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            aria-label="Completed"
            className="min-h-11 flex-none gap-2 px-0"
          >
            Completed
            <Badge variant="secondary">{completed.length}</Badge>
          </TabsTrigger>
        </ScrollableTabsList>
        <TabsContent value="my-jobs">
          <JobTable
            label="My Jobs"
            assignments={assigned}
            emptyTitle="No assigned jobs"
            status={(assignment) =>
              draftStatus(fieldwork[assignment.id]!, assignment.scheduledAt)
            }
            action={(assignment) => (
              <Link
                to="/eho/inspections/$inspectionId"
                params={{ inspectionId: assignment.id }}
                className={buttonVariants({
                  variant: "link",
                  className: "min-h-11 px-0",
                })}
              >
                {Object.keys(fieldwork[assignment.id]?.answers ?? {}).length
                  ? "Continue"
                  : "Open job"}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            )}
          />
        </TabsContent>
        <TabsContent value="follow-ups">
          <JobTable
            label="Follow-up"
            assignments={followUps}
            emptyTitle="No follow-up jobs"
            scheduledAt={(assignment) =>
              followUpScenarios[assignment.id]?.scheduledAt ??
              assignment.scheduledAt
            }
            additionalSearchText={(assignment) =>
              followUpScenarios[assignment.id]?.reference ?? ""
            }
            status={(assignment) =>
              followUpStatus[assignment.id] === "completed" ? (
                <Badge variant="success">Completed</Badge>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="warning">Follow-up due</Badge>
                  {isOverdue(
                    followUpScenarios[assignment.id]?.scheduledAt ??
                      assignment.scheduledAt
                  ) && <Badge variant="destructive">Overdue</Badge>}
                </div>
              )
            }
            action={(assignment) => (
              <Link
                to="/eho/inspections/$inspectionId/follow-up"
                params={{ inspectionId: assignment.id }}
                className={buttonVariants({
                  variant: "link",
                  className: "min-h-11 px-0",
                })}
              >
                {followUpStatus[assignment.id] === "completed"
                  ? "View follow-up"
                  : "Open follow-up"}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            )}
          />
        </TabsContent>
        <TabsContent value="completed">
          <JobTable
            label="Completed"
            assignments={completed}
            emptyTitle="No completed jobs"
            status={(assignment) =>
              draftStatus(fieldwork[assignment.id]!, assignment.scheduledAt)
            }
            action={(assignment) => (
              <Link
                to="/eho/inspections/$inspectionId"
                params={{ inspectionId: assignment.id }}
                className={buttonVariants({
                  variant: "link",
                  className: "min-h-11 px-0",
                })}
              >
                View record
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function EhoInspectionListPage() {
  const { claimAssignment, fieldwork } = useEho()
  const openAssignments = assignments.filter(
    (assignment) => !fieldwork[assignment.id]
  )
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Open inspections"
        description="Available council work appears here until an officer claims it. Assign a job to yourself to begin a saved draft."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/eho/my-work" />}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" /> My Work
          </Button>
        }
      />
      <JobTable
        label="open jobs"
        assignments={openAssignments}
        emptyTitle="No open inspections"
        status={(assignment) => (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Open</Badge>
            {isOverdue(assignment.scheduledAt) && (
              <Badge variant="destructive">Overdue</Badge>
            )}
            <Badge
              variant={assignment.notice === "Served" ? "success" : "warning"}
            >
              Notice {assignment.notice.toLowerCase()}
            </Badge>
          </div>
        )}
        action={(assignment) => (
          <Link
            to="/eho/inspections/$inspectionId"
            params={{ inspectionId: assignment.id }}
            onClick={(event) => {
              if (!claimAssignment(assignment.id)) event.preventDefault()
            }}
            className={buttonVariants({
              variant: "link",
              className: "min-h-11 px-0",
            })}
          >
            Assign to me
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        )}
      />
    </div>
  )
}

function certificateName(type: string) {
  return type.endsWith("Certificate") ? type : `${type} Certificate`
}

export function InspectionCertificateGrid({
  assignment,
  draft,
}: {
  assignment: Assignment
  draft: Fieldwork
}) {
  const premises = premisesFor(assignment)
  const inspectionSubmitted = draft.status !== "draft"

  return (
    <section aria-labelledby="inspection-certificates" className="pt-2">
      <div className="mb-4">
        <h2
          id="inspection-certificates"
          className="text-lg font-semibold tracking-tight"
        >
          Certificates
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open available certificate records in a separate tab.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {premises?.certificates.map((certificate) => {
          const name = certificateName(certificate.type)
          const available =
            Boolean(certificate.id) &&
            (certificate.type !== "Fumigation" || inspectionSubmitted)
          const content = (
            <Card className="h-full">
              <CardHeader>
                <div className="mb-3 grid size-10 place-items-center rounded-lg bg-muted text-primary">
                  {available ? (
                    <FileBadge2 aria-hidden="true" />
                  ) : (
                    <LockKeyhole aria-hidden="true" />
                  )}
                </div>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                  {available
                    ? certificate.id
                    : "Available after the premises inspection is submitted."}
                </CardDescription>
                <CardAction>
                  {available ? (
                    <StatusBadge status={certificate.status} />
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </CardAction>
              </CardHeader>
              <CardContent>
                {available && certificate.expiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Expires {formatInspectionDate(certificate.expiresAt)}
                  </p>
                )}
                {available && (
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View certificate
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </p>
                )}
              </CardContent>
            </Card>
          )

          return available ? (
            <a
              key={certificate.id}
              href={`/eho/premises/${encodeURIComponent(assignment.premisesId)}?inspection=${encodeURIComponent(assignment.id)}&certificate=${encodeURIComponent(certificate.id ?? "")}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${name} in a new tab`}
              className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <article className="h-full">{content}</article>
            </a>
          ) : (
            <article
              key={certificate.id}
              aria-disabled="true"
              className="opacity-60"
            >
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function InspectionOverviewCard({
  assignment,
  draft,
  progress,
  followUpRequired,
  followUpCompleted,
  historyCount = 0,
  onProgressChange,
  onStart,
  onStartFollowUp,
  onSubmitWork,
}: {
  assignment: Assignment
  draft: Fieldwork
  progress: InspectionTaskProgress
  followUpRequired: boolean
  followUpCompleted: boolean
  historyCount?: number
  onProgressChange: (progress: InspectionTaskProgress) => void
  onStart: () => void
  onStartFollowUp: () => void
  onSubmitWork: () => void
}) {
  const premises = premisesFor(assignment)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState(
    `Dear ${premises?.businessName ?? "Business owner"},\n\nThis is to notify you that an Environmental Health Officer will visit your premises to conduct a ${assignment.type.toLowerCase()}. The inspection appointment will be scheduled after you acknowledge receipt of this notice.\n\nPlease confirm that you have received this notice.`
  )
  const [noticeError, setNoticeError] = useState("")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [scheduleError, setScheduleError] = useState("")
  const action = nextTaskAction(
    progress,
    draft,
    followUpRequired,
    followUpCompleted
  )
  const earliestDate = earliestAppointmentDate(progress) ?? ""
  const inspectionComplete = draft.status !== "draft"
  const steps = [
    {
      label: "Notice and acknowledgement",
      detail: !progress.noticeSentAt
        ? "Notice not sent"
        : !progress.acknowledgedAt
          ? "Sent · awaiting business acknowledgement"
          : `Acknowledged ${progress.acknowledgedAt.slice(0, 10)}`,
      complete: Boolean(progress.acknowledgedAt),
      current: !progress.acknowledgedAt,
    },
    {
      label: "Inspection appointment",
      detail: progress.appointmentDate
        ? `Scheduled for ${formatInspectionDate(progress.appointmentDate)}`
        : progress.acknowledgedAt
          ? "Ready to schedule"
          : "Available after acknowledgement",
      complete: Boolean(progress.appointmentDate),
      current: Boolean(progress.acknowledgedAt && !progress.appointmentDate),
    },
    {
      label: "Premises inspection",
      detail: inspectionComplete
        ? "Inspection result submitted"
        : progress.appointmentDate
          ? Object.keys(draft.answers).length
            ? "Checklist in progress"
            : "Ready to begin on the premises"
          : "Available after scheduling",
      complete: inspectionComplete,
      current: Boolean(progress.appointmentDate && !inspectionComplete),
    },
    {
      label: "Follow-up inspection",
      detail: !inspectionComplete
        ? "Required only when findings need verification"
        : !followUpRequired
          ? "Not required"
          : followUpCompleted
            ? "Follow-up completed"
            : progress.followUpStartedAt
              ? "Follow-up in progress"
              : "Required before task closure",
      complete: inspectionComplete && (!followUpRequired || followUpCompleted),
      current: Boolean(
        inspectionComplete && followUpRequired && !followUpCompleted
      ),
    },
    {
      label: "Task closure",
      detail: progress.completedAt
        ? `Submitted as done ${progress.completedAt.slice(0, 10)}`
        : "Available when all required work is complete",
      complete: Boolean(progress.completedAt),
      current: action.id === "submit-work" && !action.disabled,
    },
  ]

  function runPrimaryAction() {
    if (action.disabled) return
    switch (action.id) {
      case "send-notice":
        setNoticeError("")
        setNoticeOpen(true)
        return
      case "schedule-appointment":
        setAppointmentDate(earliestDate)
        setScheduleError("")
        setScheduleOpen(true)
        return
      case "start-inspection":
      case "continue-inspection":
        onStart()
        return
      case "start-follow-up":
        onProgressChange(startFollowUp(progress))
        onStartFollowUp()
        return
      case "continue-follow-up":
        onStartFollowUp()
        return
      case "submit-work":
        onSubmitWork()
        return
      default:
        return
    }
  }

  function confirmAppointment(event: React.FormEvent) {
    event.preventDefault()
    try {
      onProgressChange(scheduleAppointment(progress, appointmentDate))
      setScheduleOpen(false)
      setScheduleError("")
    } catch (error) {
      setScheduleError(
        error instanceof Error ? error.message : "Choose a valid date."
      )
    }
  }

  function confirmNotice(event: React.FormEvent) {
    event.preventDefault()
    if (!noticeMessage.trim()) {
      setNoticeError("Enter a message before sending the notice.")
      return
    }
    onProgressChange(sendInspectionNotice(progress))
    setNoticeOpen(false)
    setNoticeError("")
    notifySuccess("Notice has been sent.")
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,1fr)]">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Inspection workflow</CardTitle>
          <CardDescription>
            Complete each requirement in order. The main action updates as the
            work progresses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col" aria-label="Inspection task progress">
            {steps.map((step, index) => (
              <li
                key={step.label}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {index < steps.length - 1 && (
                  <span
                    className="absolute top-6 left-2.5 h-[calc(100%-0.25rem)] w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-card">
                  {step.complete ? (
                    <CheckCircle2 className="text-primary" aria-hidden="true" />
                  ) : step.current ? (
                    <Circle
                      className="fill-primary text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{step.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          {draft.status === "queued" && (
            <Alert>
              <AlertDescription>
                Submitted on this device and queued locally. No server delivery
                is claimed.
              </AlertDescription>
            </Alert>
          )}
          <div className="mt-2 rounded-lg bg-muted/60 p-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Next action
            </p>
            <p className="mt-1 text-sm">{action.reason}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="min-h-11 w-full sm:w-auto"
                disabled={action.disabled}
                onClick={runPrimaryAction}
              >
                {action.id === "send-notice" && (
                  <Send data-icon="inline-start" aria-hidden="true" />
                )}
                {action.id === "schedule-appointment" && (
                  <CalendarDays data-icon="inline-start" aria-hidden="true" />
                )}
                {action.label}
                {!action.disabled && action.id !== "send-notice" && (
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                )}
              </Button>
              {action.id === "await-acknowledgement" && (
                <Button
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  onClick={() =>
                    onProgressChange(acknowledgeInspectionNotice(progress))
                  }
                >
                  <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
                  Acknowledge
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Premises and records</CardTitle>
          <CardDescription>
            Reference details for this inspection task.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">
            {premises?.businessName ?? "Premises record unavailable"}
          </p>
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {premises?.address}
          </p>
          <p>
            {premises?.premisesType} · {premises?.ward}
          </p>
          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
            <div>
              <dt className="text-muted-foreground">Assigned officers</dt>
              <dd className="mt-1 font-medium">
                {assignment.officers.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Open findings</dt>
              <dd className="mt-1 font-medium">
                {premises?.outstandingContraventions ?? "Unavailable"}
              </dd>
            </div>
          </dl>
          <div className="flex flex-col border-t pt-2">
            <Button
              variant="ghost"
              className="min-h-11 justify-start px-2"
              nativeButton={false}
              render={
                <a
                  href={`/eho/inspections/${encodeURIComponent(assignment.id)}/notice`}
                />
              }
            >
              <FileText data-icon="inline-start" aria-hidden="true" />
              View notice
            </Button>
            {premises && (
              <Button
                variant="ghost"
                className="min-h-11 justify-start px-2"
                nativeButton={false}
                render={
                  <a
                    href={`/eho/premises/${encodeURIComponent(premises.id)}?inspection=${encodeURIComponent(assignment.id)}&tab=history`}
                  />
                }
              >
                <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
                Inspection history · {historyCount}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent>
          <form onSubmit={confirmNotice}>
            <DialogHeader>
              <DialogTitle>Send inspection notice</DialogTitle>
              <DialogDescription>
                Review the message that will be sent to the business.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="mt-6">
              <Field data-invalid={Boolean(noticeError)}>
                <FieldLabel htmlFor="inspection-notice-message">
                  Notice message
                </FieldLabel>
                <Textarea
                  id="inspection-notice-message"
                  className="min-h-36 resize-y"
                  value={noticeMessage}
                  onChange={(event) => {
                    setNoticeMessage(event.target.value)
                    setNoticeError("")
                  }}
                  aria-invalid={Boolean(noticeError)}
                  required
                />
                <FieldDescription>
                  You can edit this message before sending it.
                </FieldDescription>
                <FieldError>{noticeError}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6" showCloseButton>
              <Button type="submit">
                <Send data-icon="inline-start" aria-hidden="true" />
                Send notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <form onSubmit={confirmAppointment}>
            <DialogHeader>
              <DialogTitle>Schedule inspection appointment</DialogTitle>
              <DialogDescription>
                The visit must be at least seven days after the business
                acknowledged the notice.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="mt-6">
              <Field data-invalid={Boolean(scheduleError)}>
                <FieldLabel htmlFor="inspection-appointment-date">
                  Appointment date
                </FieldLabel>
                <Input
                  id="inspection-appointment-date"
                  type="date"
                  min={earliestDate}
                  value={appointmentDate}
                  onChange={(event) => {
                    setAppointmentDate(event.target.value)
                    setScheduleError("")
                  }}
                  aria-invalid={Boolean(scheduleError)}
                  required
                />
                <FieldDescription>
                  Earliest available date: {earliestDate}
                </FieldDescription>
                <FieldError>{scheduleError}</FieldError>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-6" showCloseButton>
              <Button type="submit">
                <CalendarDays data-icon="inline-start" aria-hidden="true" />
                Schedule appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function EhoOverviewPage({ inspectionId }: { inspectionId: string }) {
  const assignment = assignments.find((item) => item.id === inspectionId)
  const { officer, getDraft, fieldwork, updateDraft } = useEho()
  const [savedProgress, setSavedProgress] =
    useState<InspectionTaskProgress | null>(null)
  const [taskMessage, setTaskMessage] = useState("")
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    if (!assignment || !officer) return
    setSavedProgress(readTaskProgress(localStorage, officer.id, assignment))
  }, [assignment, officer])

  if (!assignment)
    return (
      <EmptyState
        title="Inspection not found"
        description="Return to My Work to choose an assigned visit."
      />
    )
  const premises = premisesFor(assignment)
  const draft = getDraft(inspectionId)
  const progress =
    savedProgress?.assignmentId === inspectionId
      ? savedProgress
      : createTaskProgress(assignment)
  const followUpRequired =
    draft.status === "submitted" &&
    draft.issues.length > 0 &&
    Boolean(followUpScenarios[inspectionId])
  const followUpCompleted = Boolean(
    officer &&
    followUpRequired &&
    typeof window !== "undefined" &&
    readFollowUp(localStorage, officer.id, inspectionId).status === "completed"
  )

  function persistProgress(next: InspectionTaskProgress, message: string) {
    if (!officer) return
    try {
      saveTaskProgress(localStorage, officer.id, next)
      setSavedProgress(next)
      setTaskMessage(message)
    } catch {
      setTaskMessage(
        "Could not save this task update. Keep this page open and try again."
      )
    }
  }

  function resetFlow() {
    if (!officer || !assignment) return
    if (!updateDraft(createDraft(assignment))) {
      setTaskMessage("Could not reset this inspection. Try again.")
      return
    }
    try {
      localStorage.removeItem(followUpStorageKey(officer.id, inspectionId))
      const reset = resetTaskProgress(inspectionId)
      saveTaskProgress(localStorage, officer.id, reset)
      setSavedProgress(reset)
      setTaskMessage("Inspection flow reset. Send a new notice to begin again.")
      setResetOpen(false)
    } catch {
      setTaskMessage("Could not reset this inspection. Try again.")
    }
  }

  return (
    <div className="space-y-6 pb-16 sm:pb-20">
      <Link
        to="/eho/inspections"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <PageHeader
        title="Inspection overview"
        description="Manage the notice, appointment, fieldwork, and completion of this inspection task."
      />
      <section
        aria-label="Inspection summary"
        className="relative overflow-hidden rounded-xl border bg-card shadow-xs"
      >
        <span
          className="absolute inset-y-0 left-0 w-1 bg-primary"
          aria-hidden="true"
        />
        <div className="grid gap-5 p-5 pl-6 sm:p-6 sm:pl-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:size-12">
              <Building2 className="size-5 sm:size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Inspection {assignment.id}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance md:text-3xl">
                {premises?.businessName ?? "Premises unavailable"}
              </h2>
              <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                <span>{assignment.type}</span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {progress.appointmentDate
                    ? formatInspectionDate(progress.appointmentDate)
                    : "Appointment not scheduled"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-end">
            <Badge
              variant={progress.completedAt ? "success" : "secondary"}
              className="w-fit"
            >
              {progress.completedAt ? "Work completed" : "Active task"}
            </Badge>
            <Button
              variant="outline"
              className="min-h-11 bg-background sm:w-auto"
              nativeButton={false}
              render={
                <a
                  href={`/eho/premises/${assignment.premisesId}?inspection=${assignment.id}`}
                />
              }
            >
              View premises compliance
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
      {taskMessage && (
        <p role="status" className="text-sm text-muted-foreground">
          {taskMessage}
        </p>
      )}
      <InspectionOverviewCard
        assignment={assignment}
        draft={draft}
        progress={progress}
        followUpRequired={followUpRequired}
        followUpCompleted={followUpCompleted}
        historyCount={
          premises
            ? inspectionHistory(
                premises,
                fieldwork,
                new Date().toISOString().slice(0, 10)
              ).length
            : 0
        }
        onProgressChange={(next) => {
          const message = !progress.noticeSentAt
            ? "Notice sent. Waiting for the business to acknowledge receipt."
            : !progress.acknowledgedAt && next.acknowledgedAt
              ? "Business acknowledgement recorded. Schedule the inspection appointment."
              : !progress.appointmentDate && next.appointmentDate
                ? `Inspection appointment scheduled for ${formatInspectionDate(next.appointmentDate)}.`
                : "Task progress saved."
          persistProgress(next, message)
        }}
        onStart={() =>
          window.location.assign(`/eho/inspections/${inspectionId}/checklist`)
        }
        onStartFollowUp={() =>
          window.location.assign(`/eho/inspections/${inspectionId}/follow-up`)
        }
        onSubmitWork={() => {
          try {
            persistProgress(
              completeTask(
                progress,
                draft,
                followUpRequired,
                followUpCompleted
              ),
              "Inspection task submitted as done."
            )
          } catch (error) {
            setTaskMessage(
              error instanceof Error
                ? error.message
                : "This task cannot be submitted yet."
            )
          }
        }}
      />
      {draft.status !== "draft" && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="min-h-11"
            nativeButton={false}
            render={
              <Link
                to="/eho/inspections/$inspectionId/result"
                params={{ inspectionId }}
              />
            }
          >
            View submission result
          </Button>
          <Button
            variant="outline"
            className="min-h-11"
            nativeButton={false}
            render={
              <Link
                to="/eho/inspections/$inspectionId/findings"
                params={{ inspectionId }}
              />
            }
          >
            View findings summary
          </Button>
        </div>
      )}
      <InspectionCertificateGrid assignment={assignment} draft={draft} />
      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Reset inspection flow</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Clear saved progress for this inspection job and start again.
          </p>
        </div>
        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Reset flow
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset this inspection flow?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears the notice, appointment, checklist, findings,
                follow-up, and closure progress saved for {assignment.id} on
                this device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep progress</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={resetFlow}>
                Reset inspection
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function EhoCompliancePage({ premisesId }: { premisesId: string }) {
  const { officer, fieldwork, claimAssignment } = useEho()
  const [certificateId, setCertificateId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("certificates")
  const premises = seedDatabase.premises.find((item) => item.id === premisesId)
  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    setCertificateId(search.get("certificate"))
    const tab = search.get("tab")
    setActiveTab(
      tab === "history" || tab === "documents" || tab === "findings"
        ? tab
        : "certificates"
    )
  }, [premisesId])
  useEffect(() => {
    if (officer && premises?.councilId === officer.councilId) {
      try {
        saveRecentPremises(localStorage, officer.id, premises.id)
      } catch {
        // Search still works when device storage is unavailable.
      }
    }
  }, [officer, premises])
  const from =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("inspection")
      : null
  const source =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("source")
      : null
  if (!premises || premises.councilId !== officer?.councilId)
    return (
      <EmptyState
        title="Premises record not found"
        description="This record may no longer be available on this device."
      />
    )
  const backHref = `/eho/premises/${encodeURIComponent(premises.id)}${
    from
      ? `?inspection=${encodeURIComponent(from)}`
      : source === "search"
        ? "?source=search"
        : ""
  }`
  const historyEntries = inspectionHistory(
    premises,
    fieldwork,
    new Date().toISOString().slice(0, 10)
  )
  const findings = capturedPremisesFindings(premises.id, fieldwork)
  const premisesAssignment = assignments.find((assignment) =>
    from ? assignment.id === from : assignment.premisesId === premises.id
  )
  const isAssigned = premisesAssignment
    ? Boolean(fieldwork[premisesAssignment.id])
    : false

  function selectTab(value: string) {
    setActiveTab(value)
    const url = new URL(window.location.href)
    if (value === "certificates") url.searchParams.delete("tab")
    else url.searchParams.set("tab", value)
    window.history.replaceState(window.history.state, "", url)
  }

  if (certificateId !== null) {
    const certificate = premises.certificates.find(
      (item) => item.id === certificateId
    )
    if (!certificate)
      return (
        <div className="space-y-5">
          <a
            href={backHref}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to premises
            certificates
          </a>
          <EmptyState
            title="Certificate record not found"
            description="Return to the premises record to choose an available certificate."
          />
        </div>
      )
    return (
      <EhoCertificateDetail
        premises={premises}
        certificate={certificate}
        backHref={backHref}
      />
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="link"
        className="min-h-11 self-start px-0"
        nativeButton={false}
        render={
          <a
            href={
              from
                ? `/eho/inspections/${encodeURIComponent(from)}`
                : source === "search"
                  ? "/eho/premises-search"
                  : "/eho/my-work"
            }
          />
        }
      >
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        {from
          ? "Return to inspection"
          : source === "search"
            ? "Back to search"
            : "Dashboard"}
      </Button>
      <PageHeader
        eyebrow={premises.id}
        title={premises.businessName}
        description={`${premises.address} · ${premises.ward}`}
        actions={<StatusBadge status={premises.complianceStatus} />}
      />
      <Alert>
        <AlertDescription>
          Certificate and document details may be stale when offline. “Not
          Found” means no digital record; it does not mean non-compliance.
        </AlertDescription>
      </Alert>
      <Card size="sm">
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            {isAssigned ? "Assigned to you" : "Assign this job"}
          </CardTitle>
          <CardDescription>
            {isAssigned
              ? "This premises inspection is in My Jobs and ready for you to continue."
              : "Claim this premises inspection to add it to My Jobs and create a saved draft."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-row flex-wrap gap-2">
          {isAssigned && premisesAssignment ? (
            <Button
              nativeButton={false}
              render={
                <a
                  href={`/eho/inspections/${encodeURIComponent(premisesAssignment.id)}`}
                />
              }
            >
              Open job
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          ) : premisesAssignment ? (
            <Button
              onClick={() => {
                if (claimAssignment(premisesAssignment.id))
                  notifySuccess("Inspection assigned to you.")
              }}
            >
              <UserRoundCheck data-icon="inline-start" aria-hidden="true" />
              Assign to me
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              No open inspection is available for this premises.
            </p>
          )}
          {isAssigned && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/eho/my-work" />}
            >
              View My Jobs
            </Button>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <WorkMetric
          label="Open findings"
          value={premises.outstandingContraventions}
          icon={ClipboardCheck}
        />
        <WorkMetric
          label="Certificates"
          value={premises.certificates.length}
          icon={FileBadge2}
        />
        <WorkMetric
          label="Documents"
          value={premises.documents.length}
          icon={FileText}
        />
      </div>
      <Tabs value={activeTab} onValueChange={selectTab} className="gap-4">
        <div className="overflow-x-auto overflow-y-hidden border-b pb-1.5">
          <TabsList
            variant="line"
            className="min-h-11 w-max min-w-full justify-start gap-5 px-0 sm:gap-7"
          >
            <TabsTrigger
              value="certificates"
              className="min-h-11 flex-none px-0"
            >
              Certificates
            </TabsTrigger>
            <TabsTrigger value="history" className="min-h-11 flex-none px-0">
              Inspection history
            </TabsTrigger>
            <TabsTrigger value="findings" className="min-h-11 flex-none px-0">
              Findings
            </TabsTrigger>
            <TabsTrigger value="documents" className="min-h-11 flex-none px-0">
              Documents
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="certificates">
          <Card>
            <CardContent className="divide-y p-4 sm:p-5">
              {premises.certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium">{certificate.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {certificate.id} · Expires {certificate.expiresAt}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={certificate.status} />
                    {certificate.id && (
                      <a
                        href={`${backHref}${backHref.includes("?") ? "&" : "?"}certificate=${encodeURIComponent(certificate.id)}`}
                        aria-label={`View ${certificate.type} certificate ${certificate.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "min-h-11",
                        })}
                      >
                        View certificate
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <EhoPaperCertificatePanel
            officerId={officer.id}
            premisesId={premises.id}
          />
        </TabsContent>
        <TabsContent value="history">
          <EhoInspectionHistoryPanel entries={historyEntries} />
        </TabsContent>
        <TabsContent value="findings">
          <EhoPremisesFindingsPanel
            councilOutstanding={premises.outstandingContraventions}
            findings={findings}
          />
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardContent className="divide-y p-4 sm:p-5">
              {premises.documents.map((document) => (
                <div key={document.id} className="py-3">
                  <p className="font-medium">{document.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.category} · {document.addedAt}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
