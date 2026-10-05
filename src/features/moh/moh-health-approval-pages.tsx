import { LinkedTableRow } from "@/components/shared/linked-table-row"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
} from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PremisesAvatar } from "@/components/shared/premises-avatar"
import { ScrollableTabsList } from "@/components/shared/scrollable-tabs-list"
import { VerifiedBusinessName } from "@/components/shared/verified-business-name"
import { isKybVerifiedBusiness } from "@/data/seeds"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { filterAndSortHealthApprovalCases } from "./moh-health-approval-worklist"
import type {
  HealthApprovalCaseSort,
  HealthApprovalInspectionStatus,
  HealthApprovalWorkCase,
} from "./moh-health-approval-worklist"

type InspectionWorklistStage = "eligible" | "inspection"

const sortOptions: Array<{ value: HealthApprovalCaseSort; label: string }> = [
  { value: "newest", label: "Recently updated" },
  { value: "oldest", label: "Oldest updated" },
  { value: "business-asc", label: "Business A–Z" },
  { value: "business-desc", label: "Business Z–A" },
]

const officerOptions = [
  "Ebi Briggs",
  "Ngozi Nwankwo",
  "Ibiso Jack",
  "Tamuno George",
].map((name) => ({ value: name, label: name }))

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00.000Z`))
}

function inspectionStatusLabel(status: HealthApprovalInspectionStatus) {
  switch (status) {
    case "notice-served":
      return "Awaiting acknowledgement"
    case "acknowledged":
      return "Notice acknowledged"
    case "scheduled":
      return "Inspection scheduled"
    case "in-progress":
      return "Inspection in progress"
  }
}

function stageBadge(workCase: HealthApprovalWorkCase) {
  if (workCase.stage === "eligible")
    return <Badge variant="success">Eligible</Badge>
  if (workCase.stage === "decision")
    return <Badge variant="warning">Decision required</Badge>
  return (
    <Badge variant="secondary">
      {workCase.inspection
        ? inspectionStatusLabel(workCase.inspection.status)
        : "Inspection pending"}
    </Badge>
  )
}

function CaseAction({ workCase }: { workCase: HealthApprovalWorkCase }) {
  return (
    <Link
      to="/moh/inspections/$caseId"
      params={{ caseId: workCase.id }}
      className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {workCase.stage === "eligible" ? "Check eligibility" : "Track inspection"}
    </Link>
  )
}

function WorklistTable({ cases }: { cases: HealthApprovalWorkCase[] }) {
  if (!cases.length)
    return (
      <EmptyState
        title="No cases found"
        description="Try another search or choose a different worklist."
      />
    )

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-background md:block">
        <Table aria-label="Inspection cases">
          <TableCaption className="sr-only">
            Health Approval inspection cases for Port Harcourt City Council
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Officer or requirement</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((workCase) => (
              <LinkedTableRow key={workCase.id}>
                <TableCell className="min-w-64 whitespace-normal">
                  <div className="flex items-center gap-3">
                    <PremisesAvatar name={workCase.businessName} />
                    <div className="min-w-0">
                      <p className="font-medium">
                        <VerifiedBusinessName
                          name={workCase.businessName}
                          verified={isKybVerifiedBusiness(
                            workCase.businessName
                          )}
                        />
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {workCase.businessType} · {workCase.address}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{stageBadge(workCase)}</TableCell>
                <TableCell className="max-w-64 whitespace-normal">
                  {workCase.stage === "eligible"
                    ? "Fitness and Fumigation requirements met"
                    : workCase.inspection?.officer}
                </TableCell>
                <TableCell>{formatDate(workCase.stageDate)}</TableCell>
                <TableCell className="text-right">
                  <CaseAction workCase={workCase} />
                </TableCell>
              </LinkedTableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {cases.map((workCase) => (
          <Card key={workCase.id} size="sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <PremisesAvatar name={workCase.businessName} />
                <div className="min-w-0">
                  <CardTitle>
                    <VerifiedBusinessName
                      name={workCase.businessName}
                      verified={isKybVerifiedBusiness(workCase.businessName)}
                    />
                  </CardTitle>
                  <CardDescription>{workCase.businessType}</CardDescription>
                </div>
              </div>
              <CardAction>{stageBadge(workCase)}</CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p>{workCase.address}</p>
              <p className="text-muted-foreground">
                {workCase.stage === "eligible"
                  ? "Fitness and Fumigation requirements met"
                  : workCase.inspection?.officer}
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <CaseAction workCase={workCase} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

export function MohHealthApprovalWorklist({
  cases,
}: {
  cases: HealthApprovalWorkCase[]
}) {
  const [activeStage, setActiveStage] =
    useState<InspectionWorklistStage>("eligible")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<HealthApprovalCaseSort>("newest")
  const inspectionCases = cases.filter(
    (item): item is HealthApprovalWorkCase => item.stage !== "decision"
  )
  const counts = {
    eligible: inspectionCases.filter((item) => item.stage === "eligible")
      .length,
    inspection: inspectionCases.filter((item) => item.stage === "inspection")
      .length,
  }
  const visibleCases = filterAndSortHealthApprovalCases(
    inspectionCases.filter((item) => item.stage === activeStage),
    query,
    sort
  )

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Inspections"
        description="Assign eligible businesses to an Environmental Health Officer and track their approval inspections."
        actions={
          <Badge variant="secondary">
            {inspectionCases.length} active inspections
          </Badge>
        }
      />

      <Tabs
        value={activeStage}
        onValueChange={(value) =>
          setActiveStage(value as InspectionWorklistStage)
        }
        className="gap-4"
      >
        <ScrollableTabsList aria-label="Health Approval stage">
          <TabsTrigger value="eligible" className="min-h-11 flex-none px-0">
            Awaiting assignment{" "}
            <Badge variant="secondary">{counts.eligible}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inspection" className="min-h-11 flex-none px-0">
            Scheduled &amp; in progress{" "}
            <Badge variant="secondary">{counts.inspection}</Badge>
          </TabsTrigger>
        </ScrollableTabsList>

        <TabsContent value={activeStage} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <Field>
              <FieldLabel htmlFor="health-approval-search" className="sr-only">
                Search inspection cases
              </FieldLabel>
              <Input
                id="health-approval-search"
                type="search"
                className="min-h-11"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search businesses, wards or inspectors"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="health-approval-sort" className="sr-only">
                Sort inspection cases
              </FieldLabel>
              <Select
                items={sortOptions}
                value={sort}
                onValueChange={(value) => setSort(value ?? "newest")}
              >
                <SelectTrigger
                  id="health-approval-sort"
                  aria-label="Sort inspection cases"
                  className="min-h-11 w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <WorklistTable cases={visibleCases} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RequirementCard({
  icon: Icon,
  title,
  reference,
  detail,
  expiresAt,
}: {
  icon: typeof ShieldCheck
  title: string
  reference: string
  detail: string
  expiresAt: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{reference}</CardDescription>
        <CardAction>
          <Badge variant="success">Valid</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>{detail}</p>
        <p>Valid until {formatDate(expiresAt)}</p>
      </CardContent>
    </Card>
  )
}

function InspectionProgress({
  workCase,
}: {
  workCase: HealthApprovalWorkCase
}) {
  const inspection = workCase.inspection!
  const acknowledged = Boolean(inspection.acknowledgedAt)
  const fieldworkStarted = inspection.status === "in-progress"
  const steps = [
    { label: "Eligibility confirmed", complete: true, current: false },
    { label: "Inspection notice served", complete: true, current: false },
    {
      label: "Business acknowledgement",
      complete: acknowledged,
      current: !acknowledged,
    },
    {
      label: "EHO premises inspection",
      complete: false,
      current: acknowledged || fieldworkStarted,
    },
    { label: "MOH decision", complete: false, current: false },
  ]

  return (
    <section aria-labelledby="inspection-progress-heading">
      <h2
        id="inspection-progress-heading"
        className="text-lg font-semibold tracking-tight"
      >
        Inspection progress
      </h2>
      <ol
        className="mt-4 flex flex-col"
        aria-label="Approval inspection progress"
      >
        {steps.map((step, index) => (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {index < steps.length - 1 && (
              <span
                className="absolute top-6 left-2.5 h-[calc(100%-0.25rem)] w-px bg-border"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-background">
              {step.complete ? (
                <CheckCircle2 className="text-primary" aria-hidden="true" />
              ) : (
                <Circle
                  className={
                    step.current
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/50"
                  }
                  aria-hidden="true"
                />
              )}
            </span>
            <div>
              <p className="font-medium">{step.label}</p>
              {step.label === "EHO premises inspection" && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {inspection.officer} · {formatDate(inspection.scheduledAt)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function MohHealthApprovalCaseDetail({
  workCase,
  onSchedule,
}: {
  workCase: HealthApprovalWorkCase
  onSchedule: (input: {
    officer: string
    scheduledAt: string
  }) => boolean | void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [officer, setOfficer] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [formError, setFormError] = useState("")

  function submitSchedule(event: React.FormEvent) {
    event.preventDefault()
    if (!officer || !scheduledAt) {
      setFormError(
        "Choose an Environmental Health Officer and inspection date."
      )
      return
    }
    const result = onSchedule({ officer, scheduledAt })
    if (result !== false) {
      setDialogOpen(false)
      setFormError("")
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <Button
        variant="link"
        className="min-h-11 w-fit px-0"
        nativeButton={false}
        render={<Link to="/moh/inspections" />}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        Inspections
      </Button>

      <PageHeader
        title={
          <VerifiedBusinessName
            name={workCase.businessName}
            verified={isKybVerifiedBusiness(workCase.businessName)}
          />
        }
        description={`${workCase.businessType} · ${workCase.address}`}
        actions={stageBadge(workCase)}
      />

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="eligibility-evidence-heading">
            <h2
              id="eligibility-evidence-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Eligibility evidence
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Current certificate and council requirements for this premises.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <RequirementCard
                icon={FileCheck2}
                title="Fitness Certificate"
                reference={workCase.fitness.reference}
                detail={workCase.fitness.detail}
                expiresAt={workCase.fitness.expiresAt}
              />
              <RequirementCard
                icon={ShieldCheck}
                title="Fumigation Certificate"
                reference={workCase.fumigation.reference}
                detail={workCase.fumigation.detail}
                expiresAt={workCase.fumigation.expiresAt}
              />
            </div>
            <ul
              className="mt-4 divide-y border-y"
              aria-label="Council conditions"
            >
              {workCase.councilConditions.map((condition) => (
                <li key={condition} className="flex items-center gap-3 py-4">
                  <CheckCircle2
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-medium">{condition}</span>
                </li>
              ))}
            </ul>
          </section>

          {workCase.inspection && <InspectionProgress workCase={workCase} />}

          <section aria-labelledby="previous-inspection-heading">
            <h2
              id="previous-inspection-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Previous inspection
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-5 border-y py-5 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted-foreground">Completed</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(workCase.previousInspection.completedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Inspector</dt>
                <dd className="mt-1 font-medium">
                  {workCase.previousInspection.officer}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Outcome</dt>
                <dd className="mt-1 font-medium">
                  {workCase.previousInspection.outcome}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside aria-label="Health Approval next action">
          <Card className="xl:sticky xl:top-24">
            <CardHeader>
              <div className="mb-2 grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                {workCase.stage === "eligible" ? (
                  <CalendarDays aria-hidden="true" />
                ) : (
                  <ClipboardCheck aria-hidden="true" />
                )}
              </div>
              <CardTitle>
                {workCase.stage === "eligible"
                  ? "Ready for inspection"
                  : "Inspection assigned"}
              </CardTitle>
              <CardDescription>
                {workCase.stage === "eligible"
                  ? "Assign an Environmental Health Officer and schedule the approval inspection."
                  : "Track the notice, acknowledgement, and EHO fieldwork from this page."}
              </CardDescription>
            </CardHeader>
            {workCase.inspection && (
              <CardContent>
                <dl className="flex flex-col gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Inspector</dt>
                    <dd className="mt-1 font-medium">
                      {workCase.inspection.officer}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Visit date</dt>
                    <dd className="mt-1 font-medium">
                      {formatDate(workCase.inspection.scheduledAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Notice</dt>
                    <dd className="mt-1 font-medium">
                      {workCase.inspection.reference}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            )}
            {workCase.stage === "eligible" && (
              <CardFooter>
                <Button
                  className="min-h-11 w-full"
                  onClick={() => {
                    setFormError("")
                    setDialogOpen(true)
                  }}
                >
                  Schedule approval inspection
                </Button>
              </CardFooter>
            )}
          </Card>
        </aside>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={submitSchedule} noValidate>
            <DialogHeader>
              <DialogTitle>Schedule approval inspection</DialogTitle>
              <DialogDescription>
                Assign the field officer and set the proposed premises visit
                date. An inspection notice will be recorded for the business.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-5">
              <Field data-invalid={Boolean(formError && !officer)}>
                <FieldLabel htmlFor="health-approval-inspector">
                  Environmental Health Officer
                </FieldLabel>
                <Select
                  items={officerOptions}
                  value={officer}
                  onValueChange={(value) => {
                    setOfficer(value ?? "")
                    setFormError("")
                  }}
                >
                  <SelectTrigger
                    id="health-approval-inspector"
                    aria-invalid={Boolean(formError && !officer)}
                    className="min-h-11 w-full"
                  >
                    <SelectValue placeholder="Choose an inspector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {officerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={Boolean(formError && !scheduledAt)}>
                <FieldLabel htmlFor="health-approval-date">
                  Inspection date
                </FieldLabel>
                <Input
                  id="health-approval-date"
                  type="date"
                  value={scheduledAt}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => {
                    setScheduledAt(event.target.value)
                    setFormError("")
                  }}
                  aria-invalid={Boolean(formError && !scheduledAt)}
                  className="min-h-11"
                />
              </Field>
              <FieldError>{formError}</FieldError>
            </FieldGroup>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button type="submit" className="min-h-11">
                Confirm inspection schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
