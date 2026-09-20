import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FilePenLine,
  FlaskConical,
  MapPin,
  RotateCcw,
  ShieldCheck,
  WifiOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { assignments, checklist, officers } from "./eho-model"
import type { Assignment, Fieldwork } from "./eho-model"
import { accountError, canStart, signInOfficer } from "./eho-state"
import { followUpScenarios, readFollowUp } from "./eho-follow-up"
import { fumigationJobs } from "./eho-fumigation"
import { saveRecentPremises } from "./eho-premises-search"
import { EhoCertificateDetail } from "./eho-certificate-detail"
import { inspectionHistory } from "./eho-inspection-history"
import { EhoInspectionHistoryPanel } from "./eho-inspection-history-panel"
import { EhoPaperCertificatePanel } from "./eho-paper-certificate-panel"
import { capturedPremisesFindings } from "./eho-premises-findings"
import { EhoPremisesFindingsPanel } from "./eho-premises-findings-panel"
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

function AssignmentCard({
  assignment,
  draft,
}: {
  assignment: Assignment
  draft?: Fieldwork
}) {
  const premises = premisesFor(assignment)
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              status={
                draft?.status === "submitted"
                  ? "Completed"
                  : draft?.status === "queued"
                    ? "Queued locally"
                    : assignment.notice
              }
            />
            <span className="text-xs text-muted-foreground">
              {assignment.id} · {assignment.scheduledAt}
            </span>
          </div>
          <h3 className="font-semibold">
            {premises?.businessName ?? "Premises unavailable"}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ClipboardList className="size-4 shrink-0" aria-hidden="true" />
              {assignment.type}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {premises?.address ?? "Address unavailable"}
            </span>
          </div>
          {draft?.status === "draft" &&
            Object.keys(draft.answers).length > 0 && (
              <p className="text-xs font-medium text-primary">
                Draft saved · {Object.keys(draft.answers).length}/
                {checklist.length} checks answered
              </p>
            )}
        </div>
        <Button
          variant="outline"
          className="min-h-11 self-start sm:self-auto"
          nativeButton={false}
          render={
            <Link
              to="/eho/inspections/$inspectionId"
              params={{ inspectionId: assignment.id }}
            />
          }
        >
          Open inspection <ArrowRight aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
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
    <Card className="gap-0 py-0">
      <CardContent className="flex min-h-24 flex-col justify-between gap-2 p-3 sm:min-h-28 sm:p-4">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-xs text-muted-foreground sm:text-sm">
            {label}
          </span>
          <strong className="text-xl font-semibold tabular-nums sm:text-2xl">
            {value}
          </strong>
        </div>
      </CardContent>
    </Card>
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
  const pending = assignments.filter(
    (assignment) =>
      assignment.officers.includes(officer?.name ?? "") &&
      fieldwork[assignment.id]?.status !== "submitted" &&
      fieldwork[assignment.id]?.status !== "queued"
  )
  const ready = pending.find((assignment) => canStart(assignment))
  const followUps = assignments.filter(
    (assignment) =>
      assignment.officers.includes(officer?.name ?? "") &&
      followUpScenarios[assignment.id]?.notice === "Served" &&
      fieldwork[assignment.id]?.status === "submitted" &&
      (fieldwork[assignment.id]?.issues.length ?? 0) > 0
  )
  const draftCount = Object.values(fieldwork).filter(
    (draft) => draft?.status === "draft" && Object.keys(draft.answers).length
  ).length
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assigned to you"
        title={`My Work, ${officer?.name.split(" ")[0] ?? "officer"}`}
      />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <WorkMetric label="Open" value={pending.length} icon={ClipboardList} />
        <WorkMetric
          label="Ready"
          value={pending.filter(canStart).length}
          icon={CalendarDays}
        />
        <WorkMetric label="Drafts" value={draftCount} icon={FilePenLine} />
      </div>
      {ready && (
        <Card className="gap-0 border-primary/20 bg-primary/5 py-0">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Next inspection
                </p>
                <h2 className="mt-1 font-semibold">
                  {premisesFor(ready)?.businessName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {ready.scheduledAt} · {ready.type}
                </p>
              </div>
            </div>
            <Button
              className="min-h-11 self-start sm:self-auto"
              nativeButton={false}
              render={
                <Link
                  to="/eho/inspections/$inspectionId"
                  params={{ inspectionId: ready.id }}
                />
              }
            >
              Open inspection <ArrowRight aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      )}
      <Tabs defaultValue="inspections" className="gap-4">
        <TabsList
          variant="line"
          className="min-h-11 w-full justify-start gap-5 border-b px-0 sm:gap-7"
        >
          <TabsTrigger
            value="inspections"
            aria-label="Assigned inspections"
            className="min-h-11 flex-none gap-2 px-0"
          >
            <ClipboardList className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Assigned inspections</span>
            <span className="sm:hidden">Inspections</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {pending.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="follow-ups"
            aria-label="Follow-up visits"
            className="min-h-11 flex-none gap-2 px-0"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Follow-up visits</span>
            <span className="sm:hidden">Follow-ups</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {followUps.length}
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inspections" className="space-y-3">
          <div className="flex justify-end">
            <Button
              variant="link"
              nativeButton={false}
              render={<Link to="/eho/inspections" />}
            >
              View all inspections <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          {pending.length ? (
            pending.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                draft={fieldwork[assignment.id]}
              />
            ))
          ) : (
            <EmptyState
              title="No assigned inspections"
              description="New assignments will appear here."
            />
          )}
        </TabsContent>
        <TabsContent value="follow-ups" className="space-y-3 pt-2">
          {followUps.length ? (
            followUps.map((assignment) => (
              <Card key={assignment.id} className="gap-0 py-0">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <RotateCcw className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={
                            followUpStatus[assignment.id] === "completed"
                              ? "Completed"
                              : "Served"
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {followUpScenarios[assignment.id]?.reference}
                        </span>
                      </div>
                      <h3 className="font-semibold">
                        {premisesFor(assignment)?.businessName}
                      </h3>
                      <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {followUpScenarios[assignment.id]?.scheduledAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="min-h-11 self-start sm:self-auto"
                    nativeButton={false}
                    render={
                      <Link
                        to="/eho/inspections/$inspectionId/follow-up"
                        params={{ inspectionId: assignment.id }}
                      />
                    }
                  >
                    {followUpStatus[assignment.id] === "completed"
                      ? "View follow-up"
                      : "Open follow-up"}
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No follow-up visits"
              description="Visits will appear here when an inspection requires follow-up."
            />
          )}
        </TabsContent>
      </Tabs>
      <Card className="gap-0 py-0">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <FlaskConical className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold">Fumigation supervision</h2>
              <p className="text-sm text-muted-foreground">
                {
                  fumigationJobs.filter((job) => job.officerId === officer?.id)
                    .length
                }{" "}
                assigned jobs · Review provider reports
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="min-h-11 self-start sm:self-auto"
            nativeButton={false}
            render={<Link to="/eho/fumigation" />}
          >
            View jobs <ArrowRight aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function EhoInspectionListPage() {
  const { fieldwork, officer } = useEho()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("All")
  const today = new Date().toISOString().slice(0, 10)
  const rows = assignments.filter(
    (assignment) =>
      assignment.officers.includes(officer?.name ?? "") &&
      (filter === "All" ||
        (filter === "Today" && assignment.scheduledAt === today) ||
        (filter === "Upcoming" &&
          assignment.scheduledAt > today &&
          fieldwork[assignment.id]?.status !== "submitted") ||
        (filter === "Follow-up" && assignment.kind === "Follow-up") ||
        (filter === "Completed" &&
          fieldwork[assignment.id]?.status === "submitted")) &&
      `${premisesFor(assignment)?.businessName} ${premisesFor(assignment)?.address} ${assignment.id}`
        .toLowerCase()
        .includes(query.toLowerCase())
  )
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Work"
        title="Inspections"
        description="Search assigned work and open each visit from its overview."
      />
      <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="inspection-search">
          Search inspections
        </label>
        <Input
          id="inspection-search"
          placeholder="Search premises, address or reference"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-11"
        />
        <label className="sr-only" htmlFor="inspection-filter">
          Inspection filter
        </label>
        <select
          id="inspection-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="min-h-11 rounded-md border bg-background px-3 text-sm"
        >
          {["All", "Today", "Upcoming", "Follow-up", "Completed"].map(
            (value) => (
              <option key={value}>{value}</option>
            )
          )}
        </select>
      </div>
      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              draft={fieldwork[assignment.id]}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No inspections match this filter"
          description="Try another search or filter."
        />
      )}
    </div>
  )
}

export function InspectionOverviewCard({
  assignment,
  draft,
  historyCount = 0,
  onStart,
}: {
  assignment: Assignment
  draft: Fieldwork
  historyCount?: number
  onStart: () => void
}) {
  const premises = premisesFor(assignment)
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Visit readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={assignment.notice} />
            <span className="text-sm text-muted-foreground">
              {assignment.acknowledgement}
            </span>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Scheduled visit</p>
              <p className="font-medium">{assignment.scheduledAt}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned officers</p>
              <p className="font-medium">{assignment.officers.join(", ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Inspection history</p>
              <p className="font-medium">{historyCount} record(s)</p>
              {premises && (
                <a
                  href={`/eho/premises/${encodeURIComponent(premises.id)}?inspection=${encodeURIComponent(assignment.id)}&tab=history`}
                  className="mt-1 inline-flex min-h-11 items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  View inspection history
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Open findings</p>
              <p className="font-medium">
                {premises?.outstandingContraventions ?? "Unavailable"}
              </p>
            </div>
          </div>
          {!canStart(assignment) && (
            <Alert>
              <AlertDescription>
                The required inspection notice must be served before fieldwork
                can begin.
              </AlertDescription>
            </Alert>
          )}
          {draft.status === "queued" && (
            <Alert>
              <AlertDescription>
                Submitted on this device and queued locally. No server delivery
                is claimed.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              className="min-h-11"
              disabled={!canStart(assignment) || draft.status !== "draft"}
              onClick={onStart}
            >
              {Object.keys(draft.answers).length
                ? "Continue inspection"
                : "Start inspection"}
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              nativeButton={false}
              render={
                <a
                  href={`/eho/inspections/${encodeURIComponent(assignment.id)}/notice`}
                />
              }
            >
              View notice
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Premises at a glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
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
          <p className="text-muted-foreground">
            {premises?.certificates.length ?? 0} certificate records ·{" "}
            {premises?.documents.length ?? 0} supporting documents
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function EhoOverviewPage({ inspectionId }: { inspectionId: string }) {
  const assignment = assignments.find((item) => item.id === inspectionId)
  const { getDraft, fieldwork } = useEho()
  if (!assignment)
    return (
      <EmptyState
        title="Inspection not found"
        description="Return to My Work to choose an assigned visit."
      />
    )
  const premises = premisesFor(assignment)
  const draft = getDraft(inspectionId)
  return (
    <div className="space-y-6">
      <Link
        to="/eho/inspections"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All inspections
      </Link>
      <PageHeader
        eyebrow={assignment.id}
        title={premises?.businessName ?? "Premises unavailable"}
        description={`${assignment.type} · ${assignment.scheduledAt}`}
        actions={
          <StatusBadge
            status={draft.status === "draft" ? assignment.notice : draft.status}
          />
        }
      />
      <InspectionOverviewCard
        assignment={assignment}
        draft={draft}
        historyCount={
          premises
            ? inspectionHistory(
                premises,
                fieldwork,
                new Date().toISOString().slice(0, 10)
              ).length
            : 0
        }
        onStart={() =>
          window.location.assign(`/eho/inspections/${inspectionId}/checklist`)
        }
      />
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="min-h-11"
          nativeButton={false}
          render={
            <a
              href={`/eho/premises/${assignment.premisesId}?inspection=${assignment.id}`}
            />
          }
        >
          View premises compliance
        </Button>
        {draft.status !== "draft" && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

export function EhoCompliancePage({ premisesId }: { premisesId: string }) {
  const { officer, fieldwork } = useEho()
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
    <div className="space-y-6">
      <Button
        variant="link"
        className="min-h-11"
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
        <ArrowLeft />
        {from
          ? "Return to inspection"
          : source === "search"
            ? "Back to search"
            : "My Work"}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Open findings</p>
            <p className="text-2xl font-semibold">
              {premises.outstandingContraventions}
            </p>
            <a
              href={`${backHref}${backHref.includes("?") ? "&" : "?"}tab=findings`}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Review findings
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Certificates</p>
            <p className="text-2xl font-semibold">
              {premises.certificates.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Documents</p>
            <p className="text-2xl font-semibold">
              {premises.documents.length}
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          const url = new URL(window.location.href)
          if (value === "certificates") url.searchParams.delete("tab")
          else url.searchParams.set("tab", value)
          window.history.replaceState(window.history.state, "", url)
        }}
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="certificates" className="min-h-11 flex-none">
            Certificates
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-11 flex-none">
            Inspection history
          </TabsTrigger>
          <TabsTrigger value="findings" className="min-h-11 flex-none">
            Findings
          </TabsTrigger>
          <TabsTrigger value="documents" className="min-h-11 flex-none">
            Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
          <Card>
            <CardContent className="divide-y p-5">
              {premises.certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
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
            <CardContent className="divide-y p-5">
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
