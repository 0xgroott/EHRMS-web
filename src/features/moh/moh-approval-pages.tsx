import { LinkedTableRow } from "@/components/shared/linked-table-row"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  FileCheck2,
  ExternalLink,
  MapPin,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { PremisesAvatar } from "@/components/shared/premises-avatar"
import { ScrollableTabsList } from "@/components/shared/scrollable-tabs-list"
import { VerifiedBusinessName } from "@/components/shared/verified-business-name"
import { isKybVerifiedBusiness } from "@/data/seeds"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { filterAndSortMohSubmissions } from "./moh-approvals"
import type {
  HealthApprovalDecision,
  MohSubmission,
  MohSubmissionSort,
} from "./moh-approvals"

const submissionSortOptions: Array<{
  value: MohSubmissionSort
  label: string
}> = [
  { value: "newest", label: "Recently completed" },
  { value: "oldest", label: "Oldest completed" },
  { value: "business-asc", label: "Business A–Z" },
  { value: "business-desc", label: "Business Z–A" },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function ReviewLink({ submission }: { submission: MohSubmission }) {
  return (
    <Link
      to="/moh/health-approvals/$businessId"
      params={{ businessId: submission.id }}
      className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      Review
    </Link>
  )
}

type SubmissionTab = "pending" | "completed" | "rejected"

export function MohDashboard({
  submissions,
  decisions = {},
}: {
  submissions: MohSubmission[]
  decisions?: Partial<Record<string, HealthApprovalDecision>>
}) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<MohSubmissionSort>("newest")
  const [activeTab, setActiveTab] = useState<SubmissionTab>("pending")
  const pending = submissions.filter((submission) => !decisions[submission.id])
  const completed = submissions.filter(
    (submission) => decisions[submission.id]?.outcome === "approved"
  )
  const rejected = submissions.filter(
    (submission) => decisions[submission.id]?.outcome === "denied"
  )
  const submissionsByTab: Record<SubmissionTab, MohSubmission[]> = {
    pending,
    completed,
    rejected,
  }
  const visibleSubmissions = filterAndSortMohSubmissions(
    submissionsByTab[activeTab],
    query,
    sort
  )

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Health Approvals"
        description="Review businesses submitted after a completed Environmental Health Officer inspection."
        actions={
          <Badge variant="secondary">{pending.length} awaiting decision</Badge>
        }
      />

      <section aria-label="Submitted businesses">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as SubmissionTab)}
          className="gap-4"
        >
          <ScrollableTabsList aria-label="Submission status">
            <TabsTrigger value="pending" className="min-h-11 flex-none px-1">
              Pending <Badge variant="secondary">{pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="min-h-11 flex-none px-1">
              Completed <Badge variant="secondary">{completed.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="min-h-11 flex-none px-1">
              Rejected <Badge variant="secondary">{rejected.length}</Badge>
            </TabsTrigger>
          </ScrollableTabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <Field className="gap-2">
                <FieldLabel htmlFor="moh-submission-search" className="sr-only">
                  Search submitted businesses
                </FieldLabel>
                <Input
                  id="moh-submission-search"
                  type="search"
                  className="min-h-11"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search businesses, locations or inspectors"
                />
              </Field>
              <Field className="gap-2">
                <FieldLabel htmlFor="moh-submission-sort" className="sr-only">
                  Sort submitted businesses
                </FieldLabel>
                <Select
                  items={submissionSortOptions}
                  value={sort}
                  onValueChange={(value) => setSort(value ?? "newest")}
                >
                  <SelectTrigger
                    id="moh-submission-sort"
                    aria-label="Sort submitted businesses"
                    className="min-h-11 w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {submissionSortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
              <Table
                aria-label="Submitted businesses"
                className="min-w-[58rem]"
              >
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4">Business</TableHead>
                    <TableHead>Type and location</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="px-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleSubmissions.map((submission) => {
                    const decision = decisions[submission.id]
                    return (
                      <LinkedTableRow key={submission.id}>
                        <TableCell className="px-4 py-3 whitespace-normal">
                          <div className="flex items-center gap-3">
                            <PremisesAvatar
                              name={submission.businessName}
                              ariaLabel={`${submission.businessName} business logo`}
                            />
                            <p className="font-semibold">
                              <VerifiedBusinessName
                                name={submission.businessName}
                                verified={isKybVerifiedBusiness(
                                  submission.businessName
                                )}
                              />
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 whitespace-normal">
                          <p>{submission.businessType}</p>
                          <p className="mt-1 max-w-56 text-xs text-muted-foreground">
                            {submission.address}
                          </p>
                        </TableCell>
                        <TableCell className="py-3 whitespace-normal">
                          {submission.inspection.officer}
                        </TableCell>
                        <TableCell className="py-3">
                          <time dateTime={submission.inspection.completedAt}>
                            {formatDate(submission.inspection.completedAt)}
                          </time>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant={
                              decision?.outcome === "approved"
                                ? "success"
                                : decision?.outcome === "denied"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {decision?.outcome === "approved"
                              ? "Approved"
                              : decision?.outcome === "denied"
                                ? "Denied"
                                : "Awaiting decision"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <ReviewLink submission={submission} />
                        </TableCell>
                      </LinkedTableRow>
                    )
                  })}
                  {visibleSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        {query.trim()
                          ? `No ${activeTab} businesses match your search.`
                          : `No ${activeTab} businesses.`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

function CertificateCard({
  icon: Icon,
  title,
  reference,
  detail,
}: {
  icon: typeof BadgeCheck
  title: string
  reference: string
  detail: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{reference}</CardDescription>
        <CardAction>
          <Badge variant="success">
            <Check aria-hidden="true" /> Valid
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

export function MohBusinessReview({
  submission,
  decision,
  onApprove,
  onDeny,
}: {
  submission: MohSubmission
  decision?: HealthApprovalDecision
  onApprove: (id: string) => void
  onDeny: (id: string, reason: string) => void
}) {
  const [denialOpen, setDenialOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState("")

  function submitDenial(event: React.FormEvent) {
    event.preventDefault()
    const nextReason = reason.trim()
    if (!nextReason) {
      setReasonError("Enter a reason for denying this Health Approval.")
      return
    }
    onDeny(submission.id, nextReason)
    setDenialOpen(false)
    setReason("")
    setReasonError("")
  }

  return (
    <div className="flex flex-col gap-7">
      <Link
        to="/moh/health-approvals"
        className={buttonVariants({
          variant: "link",
          className: "min-h-11 w-fit px-0",
        })}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        Health Approvals
      </Link>

      <PageHeader
        title={
          <VerifiedBusinessName
            name={submission.businessName}
            verified={isKybVerifiedBusiness(submission.businessName)}
          />
        }
        description={`${submission.businessType} · ${submission.premisesId}`}
        actions={
          <Badge
            variant={
              decision?.outcome === "approved"
                ? "success"
                : decision?.outcome === "denied"
                  ? "destructive"
                  : "warning"
            }
          >
            {decision?.outcome === "approved"
              ? "Health Approval issued"
              : decision?.outcome === "denied"
                ? "Approval denied"
                : "Awaiting decision"}
          </Badge>
        }
      />

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="business-details-heading">
            <h2
              id="business-details-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Business details
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-5 border-y py-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Trading name</dt>
                <dd className="mt-1 font-medium">{submission.tradingName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Business type</dt>
                <dd className="mt-1 font-medium">{submission.businessType}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" /> Address
                </dt>
                <dd className="mt-1 font-medium">{submission.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Ward</dt>
                <dd className="mt-1 font-medium">{submission.ward}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="certificate-heading">
            <div className="mb-4">
              <h2
                id="certificate-heading"
                className="text-lg font-semibold tracking-tight"
              >
                Certificate requirements
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Both requirements were valid when the inspection was completed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <CertificateCard
                icon={ShieldCheck}
                title="Fumigation Certificate"
                reference={submission.fumigationCertificate.number}
                detail={`Valid until ${formatDate(submission.fumigationCertificate.expiresAt)}`}
              />
              <CertificateCard
                icon={UserRoundCheck}
                title="Fitness Certificates"
                reference={`${submission.fitnessCertificates.certifiedStaff} of ${submission.fitnessCertificates.totalStaff} staff certified`}
                detail={`Latest certificate issued ${formatDate(submission.fitnessCertificates.latestIssuedAt)}`}
              />
            </div>
          </section>

          <section aria-labelledby="inspection-heading">
            <h2
              id="inspection-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Inspection
            </h2>
            <Card className="mt-4" size="sm">
              <CardHeader>
                <div className="mb-2 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardCheck className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>Inspection completed</CardTitle>
                <CardDescription>
                  {submission.inspection.reference}
                </CardDescription>
                <CardAction>
                  <Badge variant="success">Complete</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Officer</dt>
                    <dd className="mt-1 font-medium">
                      {submission.inspection.officer}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Completed</dt>
                    <dd className="mt-1 font-medium">
                      {formatDate(submission.inspection.completedAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Recommendation
                    </dt>
                    <dd className="mt-1 font-medium">
                      {submission.inspection.recommendation}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </section>
        </div>

        <aside aria-label="Health Approval decision">
          <Card className="xl:sticky xl:top-6">
            <CardHeader>
              <div className="mb-2 grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                {decision ? (
                  <FileCheck2 className="size-5" aria-hidden="true" />
                ) : (
                  <Building2 className="size-5" aria-hidden="true" />
                )}
              </div>
              <CardTitle>
                {decision ? "Decision recorded" : "Make a decision"}
              </CardTitle>
              <CardDescription>
                {decision?.outcome === "approved"
                  ? "A Health Approval Certificate has been issued."
                  : decision?.outcome === "denied"
                    ? "The business was denied Health Approval."
                    : "Approve this business or deny the application with a reason."}
              </CardDescription>
            </CardHeader>
            {decision ? (
              <CardContent>
                <Badge
                  variant={
                    decision.outcome === "approved" ? "success" : "destructive"
                  }
                >
                  {decision.outcome === "approved" ? "Approved" : "Denied"}
                </Badge>
                {decision.outcome === "approved" ? (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm">
                      Certificate number: {decision.certificateNumber}
                    </p>
                    <a
                      href={`/moh/businesses/${submission.id}/certificate`}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      View certificate
                      <ExternalLink data-icon="inline-end" aria-hidden="true" />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Reason: {decision.reason}
                  </p>
                )}
              </CardContent>
            ) : (
              <CardFooter className="grid gap-2">
                <Button
                  className="min-h-11 w-full"
                  onClick={() => onApprove(submission.id)}
                >
                  <BadgeCheck data-icon="inline-start" aria-hidden="true" />
                  Approve business
                </Button>
                <Dialog open={denialOpen} onOpenChange={setDenialOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        className="min-h-11 w-full"
                      />
                    }
                  >
                    Deny approval
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={submitDenial}>
                      <DialogHeader>
                        <DialogTitle>Deny Health Approval</DialogTitle>
                        <DialogDescription>
                          Give the business a clear reason for this decision.
                          This reason will be recorded with the case.
                        </DialogDescription>
                      </DialogHeader>
                      <FieldGroup className="py-6">
                        <Field data-invalid={Boolean(reasonError)}>
                          <FieldLabel htmlFor="denial-reason">
                            Reason for denial
                          </FieldLabel>
                          <Textarea
                            id="denial-reason"
                            value={reason}
                            onChange={(event) => {
                              setReason(event.target.value)
                              setReasonError("")
                            }}
                            aria-invalid={Boolean(reasonError)}
                            placeholder="Explain what must be corrected before approval."
                            rows={5}
                          />
                          <FieldDescription>
                            Be specific enough for the business to understand
                            the next step.
                          </FieldDescription>
                          <FieldError>{reasonError}</FieldError>
                        </Field>
                      </FieldGroup>
                      <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                          Cancel
                        </DialogClose>
                        <Button type="submit" variant="destructive">
                          Submit denial
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
