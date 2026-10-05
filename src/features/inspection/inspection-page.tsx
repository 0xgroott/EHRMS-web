import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { BusinessFormDrawer } from "@/components/business/business-form-drawer"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import {
  findingsNoticeDocument,
  inspectionNoticeDocument,
} from "@/domain/business-document-downloads"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notifySuccess } from "@/components/ui/app-toast"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { seedDatabase } from "@/data/seeds"
import { useInspection } from "./inspection-context"

const stages = [
  "notice-served",
  "notice-acknowledged",
  "findings-issued",
  "corrections-recorded",
  "follow-up-served",
  "follow-up-acknowledged",
  "resolved",
  "approval-issued",
] as const

const stageLabels: Record<string, string> = {
  "notice-served": "Inspection notice served",
  "notice-acknowledged": "Inspection notice acknowledged",
  "findings-issued": "Corrective action required",
  "corrections-recorded": "Corrections recorded",
  "follow-up-served": "Follow-up notice served",
  "follow-up-acknowledged": "Follow-up notice acknowledged",
  resolved: "Findings resolved",
  "approval-issued": "Health Approval issued",
  "further-action": "Further action required",
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeZone: "Africa/Lagos",
  }).format(date)
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date)
}

function ApprovalLink({ children }: { children: React.ReactNode }) {
  return (
    <Button
      nativeButton={false}
      role="link"
      render={<Link to="/business/health-approval" />}
      variant="link"
      className="min-h-11 px-0"
    >
      {children}
    </Button>
  )
}

type TransitionResult =
  { ok: true; value: unknown } | { ok: false; error: string }

export function InspectionPage() {
  const {
    state,
    isHydrated,
    acknowledgeNotice,
    issueFindings,
    recordCorrection,
    scheduleFollowUp,
    acknowledgeFollowUp,
    resolveFollowUp,
    escalateFollowUp,
  } = useInspection()
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null
  )
  const [correctionNote, setCorrectionNote] = useState("")
  const [correctionError, setCorrectionError] = useState("")
  const [error, setError] = useState("")
  const [fieldError, setFieldError] = useState(false)

  if (!isHydrated) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading inspection</span>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const inspection = state.inspection
  if (!inspection) {
    return (
      <div className="flex max-w-4xl flex-col gap-6 pb-12">
        <PageHeader
          eyebrow="Health Approval"
          title="Inspections"
          description="No active inspection notice. Your current notice will appear here when one is scheduled."
        />
        <ApprovalLink>View Health Approval requirements</ApprovalLink>
      </div>
    )
  }

  const stageIndex = stages.indexOf(inspection.stage as (typeof stages)[number])
  const hasFindings = stageIndex >= 2 || inspection.stage === "further-action"
  const council = seedDatabase.councils.find(
    (item) => item.id === inspection.councilId
  )
  const allCorrectionsRecorded = inspection.findings.every((finding) =>
    Boolean(finding.correctionNote)
  )
  const selectedFinding = inspection.findings.find(
    (finding) => finding.id === selectedFindingId
  )

  function advance(action: () => TransitionResult, successMessage: string) {
    const result = action()
    setError(result.ok ? "" : result.error)
    if (result.ok) notifySuccess(successMessage)
  }

  function closeCorrection() {
    setSelectedFindingId(null)
    setCorrectionNote("")
    setCorrectionError("")
    setFieldError(false)
  }

  function saveCorrection(findingId: string) {
    const note = correctionNote.trim()
    if (!note) {
      setFieldError(true)
      return
    }
    const result = recordCorrection(findingId, note)
    if (result.ok) {
      setFieldError(false)
      notifySuccess(`Correction recorded for ${selectedFinding?.title}`)
      closeCorrection()
    } else {
      setCorrectionError(result.error)
    }
  }

  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Health Approval"
        title="Inspections"
        description={`Inspection record ${inspection.id} · ${inspection.premisesName}`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{stageLabels[inspection.stage]}</Badge>
      </div>

      <section aria-labelledby="first-notice" className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2
            id="first-notice"
            className="text-xl font-semibold tracking-tight"
          >
            Inspection notice
          </h2>
          <Badge variant="outline">
            {inspection.notice.acknowledgedAt
              ? "Acknowledged"
              : "Acknowledgement required"}
          </Badge>
        </div>
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Inspection type</dt>
            <dd className="mt-1 font-medium">Premises health inspection</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Scheduled inspection</dt>
            <dd className="mt-1 font-medium">
              {formatDateTime(inspection.notice.scheduledAt)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Premises</dt>
            <dd className="mt-1 font-medium">{inspection.premisesName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Issuing council</dt>
            <dd className="mt-1 font-medium">
              {council?.name || inspection.councilId}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Notice reference</dt>
            <dd className="mt-1 font-medium break-all">
              {inspection.notice.reference}
            </dd>
          </div>
        </dl>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Please make the premises and relevant records available for inspection
          at the scheduled time.
        </p>
        <DocumentDownloadButton document={inspectionNoticeDocument(inspection)}>
          Download notice
        </DocumentDownloadButton>
        {inspection.stage === "notice-served" && (
          <Button
            onClick={() =>
              advance(acknowledgeNotice, "Inspection notice acknowledged")
            }
          >
            Acknowledge notice
          </Button>
        )}
        {inspection.notice.acknowledgedAt && (
          <p className="text-sm text-muted-foreground">
            Acknowledged {formatDateTime(inspection.notice.acknowledgedAt)}
          </p>
        )}
      </section>

      {hasFindings && (
        <section aria-labelledby="findings" className="space-y-5 border-t pt-7">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Findings notice
            </p>
            <h2 id="findings" className="text-xl font-semibold tracking-tight">
              Corrective actions
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Record the steps taken for each finding. A recorded correction
              remains subject to council review at the follow-up inspection.
            </p>
          </div>
          <DocumentDownloadButton document={findingsNoticeDocument(inspection)}>
            Download findings notice
          </DocumentDownloadButton>
          <ol className="divide-y border-y">
            {inspection.findings.map((finding, index) => (
              <li
                key={finding.id}
                className="grid gap-4 py-6 md:grid-cols-[2rem_minmax(0,1fr)]"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold">{finding.title}</h3>
                    <Badge
                      variant={finding.correctionNote ? "secondary" : "outline"}
                    >
                      {finding.correctionNote
                        ? "Correction recorded"
                        : "Action required"}
                    </Badge>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p className="leading-6">
                      <span className="block text-muted-foreground">
                        Required action
                      </span>
                      {finding.action}
                    </p>
                    <p>
                      <span className="block text-muted-foreground">
                        Deadline
                      </span>
                      <time dateTime={finding.deadline}>
                        {formatDate(finding.deadline)}
                      </time>
                    </p>
                  </div>
                  {finding.correctionNote ? (
                    <div className="bg-muted/60 px-4 py-3 text-sm">
                      <p className="font-medium">Your correction record</p>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                        {finding.correctionNote}
                      </p>
                    </div>
                  ) : inspection.stage === "findings-issued" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCorrectionNote("")
                        setCorrectionError("")
                        setFieldError(false)
                        setSelectedFindingId(finding.id)
                      }}
                    >
                      Record correction
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          {allCorrectionsRecorded && (
            <p className="text-sm text-muted-foreground">
              All corrections are recorded. The council must schedule and
              complete a follow-up before closing the findings.
            </p>
          )}
        </section>
      )}

      {inspection.followUpNotice && (
        <section
          aria-labelledby="follow-up"
          className="space-y-5 border-t pt-7"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
            <h2 id="follow-up" className="text-xl font-semibold tracking-tight">
              Follow-up inspection notice
            </h2>
            <Badge variant="outline">
              {inspection.followUpNotice.acknowledgedAt
                ? "Acknowledged"
                : "Acknowledgement required"}
            </Badge>
          </div>
          <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Scheduled follow-up</dt>
              <dd className="mt-1 font-medium">
                {formatDateTime(inspection.followUpNotice.scheduledAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Follow-up reference</dt>
              <dd className="mt-1 font-medium break-all">
                {inspection.followUpNotice.reference}
              </dd>
            </div>
          </dl>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            The follow-up will review the corrections recorded against the
            original findings. This notice requires a separate acknowledgement.
          </p>
          <DocumentDownloadButton
            document={inspectionNoticeDocument(inspection, true)}
          >
            Download follow-up notice
          </DocumentDownloadButton>
          {inspection.stage === "follow-up-served" && (
            <Button
              onClick={() =>
                advance(acknowledgeFollowUp, "Follow-up notice acknowledged")
              }
            >
              Acknowledge follow-up notice
            </Button>
          )}
          {inspection.followUpNotice.acknowledgedAt && (
            <p className="text-sm text-muted-foreground">
              Acknowledged{" "}
              {formatDateTime(inspection.followUpNotice.acknowledgedAt)}
            </p>
          )}
        </section>
      )}

      {["resolved", "approval-issued", "further-action"].includes(
        inspection.stage
      ) && (
        <section aria-labelledby="outcome" className="space-y-3 border-t pt-7">
          <h2 id="outcome" className="text-xl font-semibold tracking-tight">
            Follow-up outcome
          </h2>
          <p className="max-w-2xl text-sm leading-6">
            {inspection.stage === "further-action"
              ? "The findings require further council action. No suspension or revocation has been recorded automatically."
              : "The council has marked the corrective actions resolved."}
          </p>
          <ApprovalLink>View Health Approval decision</ApprovalLink>
        </section>
      )}

      <section
        aria-labelledby="inspection-council-updates"
        className="space-y-4 border-t pt-7"
      >
        <h2 id="inspection-council-updates" className="text-lg font-semibold">
          Council updates
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Council staff complete these steps outside the business portal. View
          each update as the case progresses.
        </p>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={inspection.stage !== "notice-acknowledged"}
            onClick={() => advance(issueFindings, "Inspection findings issued")}
          >
            Show inspection findings
          </Button>
          <Button
            variant="outline"
            disabled={inspection.stage !== "corrections-recorded"}
            onClick={() =>
              advance(scheduleFollowUp, "Follow-up notice scheduled")
            }
          >
            Show follow-up notice
          </Button>
          <Button
            variant="outline"
            disabled={inspection.stage !== "follow-up-acknowledged"}
            onClick={() =>
              advance(resolveFollowUp, "Follow-up findings resolved")
            }
          >
            Show resolved outcome
          </Button>
          <Button
            variant="outline"
            disabled={inspection.stage !== "follow-up-acknowledged"}
            onClick={() => advance(escalateFollowUp, "Further action recorded")}
          >
            Show further action
          </Button>
        </div>
      </section>
      <ApprovalLink>Back to Health Approval</ApprovalLink>
      {selectedFinding && (
        <BusinessFormDrawer
          title="Record correction"
          description={selectedFinding.title}
          onClose={closeCorrection}
        >
          <form
            className="flex max-w-2xl flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault()
              saveCorrection(selectedFinding.id)
            }}
          >
            <div className="flex flex-col gap-3 text-sm">
              <p>
                <span className="block text-muted-foreground">
                  Required action
                </span>
                {selectedFinding.action}
              </p>
              <p>
                <span className="block text-muted-foreground">Deadline</span>
                <time dateTime={selectedFinding.deadline}>
                  {formatDate(selectedFinding.deadline)}
                </time>
              </p>
            </div>
            <FieldGroup>
              <Field data-invalid={fieldError}>
                <FieldLabel htmlFor="correction-note">
                  How was this corrected?
                </FieldLabel>
                <Textarea
                  id="correction-note"
                  value={correctionNote}
                  onChange={(event) => {
                    setCorrectionNote(event.target.value)
                    if (fieldError) setFieldError(false)
                  }}
                  aria-invalid={fieldError}
                  aria-describedby={fieldError ? "correction-error" : undefined}
                  placeholder="Describe the completed work"
                />
                {fieldError && (
                  <FieldError id="correction-error">
                    Enter a correction note before saving.
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
            {correctionError && (
              <Alert variant="destructive">
                <AlertDescription>{correctionError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Save correction</Button>
              <Button type="button" variant="outline" onClick={closeCorrection}>
                Cancel
              </Button>
            </div>
          </form>
        </BusinessFormDrawer>
      )}
    </div>
  )
}
