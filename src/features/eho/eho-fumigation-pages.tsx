import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  MapPin,
  Search,
  ShieldAlert,
} from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  blankReview,
  decideReview,
  fumigationJobs,
  readReview,
  saveReview,
} from "./eho-fumigation"
import type { FumigationJob, FumigationReview } from "./eho-fumigation"
import { useEho } from "./eho-session"

function premisesFor(job: FumigationJob) {
  return seedDatabase.premises.find((item) => item.id === job.premisesId)
}

export function EhoFumigationListPage() {
  const { officer } = useEho()
  const [query, setQuery] = useState("")
  const jobs = fumigationJobs.filter((job) => job.officerId === officer?.id)
  const rows = jobs.filter((job) =>
    `${job.id} ${job.provider} ${premisesFor(job)?.businessName} ${premisesFor(job)?.address}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  )
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Work"
        title="Fumigation supervision"
        description="Review assigned jobs and provider reports."
      />
      <div className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <label className="sr-only" htmlFor="fumigation-search">
          Search jobs
        </label>
        <Input
          id="fumigation-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search premises, provider or reference"
          className="min-h-11 pl-10"
        />
      </div>
      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((job) => {
            const premises = premisesFor(job)
            return (
              <Card key={job.id} className="gap-0 py-0">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-muted-foreground">
                        {job.id}
                      </span>
                    </div>
                    <h2 className="font-semibold">
                      {premises?.businessName ?? "Premises unavailable"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {job.provider}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {job.scheduledAt}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="size-4" aria-hidden="true" />
                        Provider report:{" "}
                        {job.report ? "Submitted" : "Awaiting submission"}
                      </span>
                    </div>
                    <Link
                      to="/eho/premises/$premisesId"
                      params={{ premisesId: job.premisesId }}
                      className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      View premises
                    </Link>
                  </div>
                  <Button
                    variant="outline"
                    className="min-h-11 self-start sm:self-auto"
                    nativeButton={false}
                    render={
                      <Link
                        to="/eho/fumigation/$jobId"
                        params={{ jobId: job.id }}
                      />
                    }
                  >
                    Open job <ArrowRight aria-hidden="true" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title={
            jobs.length
              ? "No jobs match your search"
              : "No fumigation supervision jobs assigned"
          }
          description={
            jobs.length
              ? "Try a premises, provider or reference."
              : "Assigned jobs will appear here."
          }
        />
      )}
    </div>
  )
}

export function EhoFumigationDetailPage({ jobId }: { jobId: string }) {
  const { officer } = useEho()
  const job = fumigationJobs.find(
    (item) => item.id === jobId && item.officerId === officer?.id
  )
  const [review, setReview] = useState<FumigationReview>(() =>
    blankReview(jobId)
  )
  const [message, setMessage] = useState("")
  useEffect(() => {
    if (officer && job) setReview(readReview(localStorage, officer.id, job.id))
  }, [officer, job])

  if (!job)
    return (
      <EmptyState
        title="Job unavailable"
        description="This fumigation job is not assigned to your account."
      />
    )
  const premises = premisesFor(job)
  function persist(next: FumigationReview) {
    if (!officer) return
    try {
      saveReview(localStorage, officer.id, next)
      setReview(next)
      setMessage("")
    } catch {
      setMessage(
        "Could not save the review on this device. Keep this page open and try again."
      )
    }
  }
  function decide(decision: "confirmed" | "disputed") {
    try {
      persist(decideReview(job!, review, decision, new Date().toISOString()))
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not review this report."
      )
    }
  }
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="min-h-11 px-0"
        nativeButton={false}
        render={<Link to="/eho/fumigation" />}
      >
        <ArrowLeft aria-hidden="true" /> All supervision jobs
      </Button>
      <PageHeader
        eyebrow={job.id}
        title={premises?.businessName ?? "Fumigation job"}
        description={`${job.provider} · ${job.scheduledAt}`}
        actions={<StatusBadge status={job.status} />}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-5 text-primary" aria-hidden="true" />{" "}
                Provider job report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.report ? (
                <div className="space-y-5 text-sm">
                  <p className="text-muted-foreground">
                    Submitted {job.report.submittedAt}
                  </p>
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium">Areas treated</dt>
                      <dd className="mt-1 text-muted-foreground">
                        {job.report.areas.join(", ") || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Pests targeted</dt>
                      <dd className="mt-1 text-muted-foreground">
                        {job.report.pests.join(", ") || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Chemicals / methods used</dt>
                      <dd className="mt-1 text-muted-foreground">
                        {job.report.methods.join(", ") || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Provider evidence</dt>
                      <dd className="mt-1 text-muted-foreground">
                        {job.report.evidence.length
                          ? job.report.evidence.join(", ")
                          : "None listed"}
                      </dd>
                    </div>
                  </dl>
                  <div>
                    <h3 className="font-medium">Provider notes</h3>
                    <p className="mt-1 leading-relaxed text-muted-foreground">
                      {job.report.notes || "Not provided"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-lg border border-dashed p-4">
                  <FileText
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium">
                      Provider report not submitted yet.
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Review actions become available after the completed job
                      report is submitted.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {job.report && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />{" "}
                  Officer review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {review.status !== "draft" ? (
                  <Alert role="status">
                    <AlertDescription>
                      Report {review.status} on{" "}
                      {review.reviewedAt
                        ? new Date(review.reviewedAt).toLocaleString()
                        : "this device"}
                      . {review.note && `Officer note: ${review.note}`}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <label className="flex min-h-11 items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={review.attended}
                        onChange={(event) =>
                          persist({ ...review, attended: event.target.checked })
                        }
                        className="mt-1 size-4 accent-primary"
                      />{" "}
                      I attended and supervised this work
                    </label>
                    <div className="grid gap-2">
                      <label
                        htmlFor="review-note"
                        className="text-sm font-medium"
                      >
                        Officer note
                      </label>
                      <Textarea
                        id="review-note"
                        value={review.note}
                        onChange={(event) =>
                          persist({ ...review, note: event.target.value })
                        }
                        placeholder="Record observations or explain a dispute"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label
                        htmlFor="review-evidence"
                        className="text-sm font-medium"
                      >
                        Evidence reference{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <Input
                        id="review-evidence"
                        value={review.evidenceReference}
                        onChange={(event) =>
                          persist({
                            ...review,
                            evidenceReference: event.target.value,
                          })
                        }
                        placeholder="Example: field note or photo reference"
                        className="min-h-11"
                      />
                    </div>
                    {message && (
                      <Alert variant="destructive" role="alert">
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => decide("confirmed")}
                        className="min-h-11"
                      >
                        Confirm report
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => decide("disputed")}
                        className="min-h-11"
                      >
                        <ShieldAlert aria-hidden="true" /> Dispute report
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Job details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Premises</p>
              <p className="mt-1 font-medium">{premises?.businessName}</p>
              <p className="mt-1 flex items-start gap-1.5 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {premises?.address}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Provider</p>
              <p className="mt-1 font-medium">{job.provider}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scheduled work</p>
              <p className="mt-1 font-medium">{job.scheduledAt}</p>
            </div>
            <Button
              variant="outline"
              className="min-h-11 w-full"
              nativeButton={false}
              render={
                <Link
                  to="/eho/premises/$premisesId"
                  params={{ premisesId: job.premisesId }}
                />
              }
            >
              View premises <ArrowRight aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
