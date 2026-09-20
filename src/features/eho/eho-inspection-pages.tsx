import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileBadge2,
  Save,
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
import { assignments, checklist } from "./eho-model"
import type { Evidence, InspectionAnswer, Issue } from "./eho-model"
import {
  canStart,
  reviewErrors,
  saveAnswer,
  saveIssue,
  submitInspection,
} from "./eho-state"
import { useEho } from "./eho-session"

const answers: InspectionAnswer[] = [
  "Satisfactory",
  "Contravention",
  "Not applicable",
  "Unable to check",
]
function contextFor(id: string) {
  const assignment = assignments.find((item) => item.id === id)
  return {
    assignment,
    premises: seedDatabase.premises.find(
      (item) => item.id === assignment?.premisesId
    ),
  }
}

export function EhoChecklistPage({ inspectionId }: { inspectionId: string }) {
  const { assignment, premises } = contextFor(inspectionId)
  const { getDraft, updateDraft } = useEho()
  const [message, setMessage] = useState("")
  if (!assignment) return <EmptyState title="Inspection not found" />
  const draft = getDraft(inspectionId)
  if (!canStart(assignment) || draft.status !== "draft")
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            {!canStart(assignment)
              ? "The required notice must be served before this inspection can begin."
              : "This inspection has already been submitted on this device."}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              to="/eho/inspections/$inspectionId"
              params={{ inspectionId }}
            />
          }
        >
          Back to overview
        </Button>
      </div>
    )
  const completed = checklist.filter(
    (item) => draft.answers[item.id] !== undefined
  ).length
  return (
    <div className="space-y-6">
      <Link
        to="/eho/inspections/$inspectionId"
        params={{ inspectionId }}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Inspection overview
      </Link>
      <PageHeader
        eyebrow={`${inspectionId} · Field checklist`}
        title={premises?.businessName ?? "Inspection checklist"}
        description="Choose one answer for each check. Changes save to this device as you work."
      />
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">Checklist progress</span>
          <span aria-live="polite">
            {completed} of {checklist.length} answered
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(100 * completed) / checklist.length}%` }}
          />
        </div>
      </div>
      <section
        aria-label="Certificate checks"
        className="rounded-xl border bg-card p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileBadge2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">Certificate checks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the recorded status before assessing the premises.
            </p>
          </div>
        </div>
        {premises?.certificates.length ? (
          <ul className="mt-4 divide-y border-t">
            {premises.certificates.map((certificate) => (
              <li
                key={certificate.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{certificate.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {certificate.id ?? "Reference unavailable"}
                    {certificate.expiresAt &&
                      certificate.status !== "Not Found" &&
                      ` · Expires ${certificate.expiresAt}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={certificate.status} />
                  {certificate.id && (
                    <a
                      href={`/eho/premises/${encodeURIComponent(assignment.premisesId)}?inspection=${encodeURIComponent(inspectionId)}&certificate=${encodeURIComponent(certificate.id)}`}
                      aria-label={`View ${certificate.type} certificate`}
                      className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      View record{" "}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            No certificate records found for this premises.
          </p>
        )}
      </section>
      <div className="grid gap-4">
        {checklist.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                {item.section}
              </p>
              <CardTitle>{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-medium">
                  Assessment<span className="sr-only"> for {item.label}</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {answers.map((answer) => (
                    <label
                      key={answer}
                      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border p-3 text-sm focus-within:ring-2 focus-within:ring-ring ${draft.answers[item.id] === answer ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/50"}`}
                    >
                      <input
                        type="radio"
                        name={`answer-${item.id}`}
                        value={answer}
                        checked={draft.answers[item.id] === answer}
                        onChange={() => {
                          if (!updateDraft(saveAnswer(draft, item.id, answer)))
                            setMessage("Unable to save this answer. Try again.")
                          else setMessage("Saved on this device")
                        }}
                      />
                      {answer}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-2">
                <label
                  htmlFor={`note-${item.id}`}
                  className="text-sm font-medium"
                >
                  Notes (optional)
                </label>
                <Textarea
                  id={`note-${item.id}`}
                  value={draft.notes[item.id] ?? ""}
                  onChange={(event) =>
                    updateDraft({
                      ...draft,
                      notes: { ...draft.notes, [item.id]: event.target.value },
                    })
                  }
                />
              </div>
              {draft.answers[item.id] === "Contravention" && (
                <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-950">
                    {
                      draft.issues.filter((issue) => issue.itemId === item.id)
                        .length
                    }{" "}
                    issue(s) recorded. Add a corrective action and deadline.
                  </p>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    nativeButton={false}
                    render={
                      <Link
                        to="/eho/inspections/$inspectionId/issues/$itemId"
                        params={{ inspectionId, itemId: item.id }}
                      />
                    }
                  >
                    Record contravention
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-3 border-t pt-5">
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() =>
            window.location.assign(`/eho/inspections/${inspectionId}`)
          }
        >
          <Save />
          Save and continue later
        </Button>
        <Button
          className="min-h-11"
          onClick={() =>
            window.location.assign(`/eho/inspections/${inspectionId}/review`)
          }
        >
          Complete inspection
        </Button>
        <Button
          variant="link"
          className="min-h-11"
          nativeButton={false}
          render={
            <a
              href={`/eho/premises/${assignment.premisesId}?inspection=${inspectionId}`}
            />
          }
        >
          View premises compliance
        </Button>
      </div>
    </div>
  )
}

export function EhoIssuePage({
  inspectionId,
  itemId,
}: {
  inspectionId: string
  itemId: string
}) {
  const assignment = assignments.find((item) => item.id === inspectionId)
  const item = checklist.find((check) => check.id === itemId)
  const { getDraft, updateDraft } = useEho()
  const [editingId, setEditingId] = useState("")
  const [description, setDescription] = useState("")
  const [action, setAction] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [evidence, setEvidence] = useState<Evidence | undefined>()
  const [error, setError] = useState("")
  if (!assignment || !item)
    return <EmptyState title="Checklist item not found" />
  const draft = getDraft(inspectionId)
  if (!canStart(assignment) || draft.status !== "draft")
    return (
      <Alert>
        <AlertDescription>This inspection cannot be edited.</AlertDescription>
      </Alert>
    )
  const issues = draft.issues.filter((issue) => issue.itemId === itemId)
  function edit(issue: Issue) {
    setEditingId(issue.id)
    setDescription(issue.description)
    setAction(issue.action)
    setDeadline(issue.deadline)
    setNotes(issue.notes)
    setEvidence(issue.evidence)
    setError("")
  }
  function save(event: React.FormEvent) {
    event.preventDefault()
    if (!description.trim() || !action.trim() || !deadline) {
      setError("Describe the issue, required corrective action, and deadline.")
      return
    }
    const issue = {
      id: editingId || crypto.randomUUID(),
      itemId,
      description: description.trim(),
      action: action.trim(),
      deadline,
      notes: notes.trim(),
      evidence,
    }
    if (updateDraft(saveIssue(draft, issue)))
      window.location.assign(`/eho/inspections/${inspectionId}/checklist`)
    else setError("Could not save this issue. Try again.")
  }
  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/eho/inspections/$inspectionId/checklist"
        params={{ inspectionId }}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to checklist
      </Link>
      <PageHeader
        eyebrow={item.section}
        title={`Contravention · ${item.label}`}
        description="Describe what needs to change and when it must be corrected."
      />
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recorded issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 first:border-0 first:pt-0"
              >
                <div>
                  <p className="font-medium">{issue.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {issue.deadline}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={() => edit(issue)}
                >
                  Edit issue
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit issue" : "Add issue"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid gap-5">
            <div className="grid gap-2">
              <label
                htmlFor="issue-description"
                className="text-sm font-medium"
              >
                Description of issue
              </label>
              <Textarea
                id="issue-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="issue-action" className="text-sm font-medium">
                Required corrective action
              </label>
              <Textarea
                id="issue-action"
                value={action}
                onChange={(event) => setAction(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="issue-deadline" className="text-sm font-medium">
                Deadline
              </label>
              <Input
                id="issue-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
                className="min-h-11"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="issue-notes" className="text-sm font-medium">
                Additional notes (optional)
              </label>
              <Textarea
                id="issue-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="issue-evidence"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Camera className="size-4" />
                Evidence file (optional)
              </label>
              <Input
                id="issue-evidence"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="h-auto min-h-11 py-2"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file)
                    setEvidence({
                      name: file.name,
                      type: file.type,
                      size: file.size,
                    })
                }}
              />
              <p className="text-xs text-muted-foreground">
                Only file details are saved on this device. The file itself is
                not uploaded or retained.
              </p>
              {evidence && <p className="text-sm">Selected: {evidence.name}</p>}
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" className="min-h-11">
                Save contravention
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                nativeButton={false}
                render={
                  <Link
                    to="/eho/inspections/$inspectionId/checklist"
                    params={{ inspectionId }}
                  />
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function EhoReviewPage({ inspectionId }: { inspectionId: string }) {
  const { assignment, premises } = contextFor(inspectionId)
  const { getDraft, updateDraft } = useEho()
  const [error, setError] = useState("")
  if (!assignment) return <EmptyState title="Inspection not found" />
  const draft = getDraft(inspectionId)
  if (!canStart(assignment) || draft.status !== "draft")
    return (
      <Alert>
        <AlertDescription>
          This inspection cannot be reviewed for submission.
        </AlertDescription>
      </Alert>
    )
  const errors = reviewErrors(draft)
  function submit() {
    try {
      if (errors.length) {
        setError("Complete the required checklist and contraventions first.")
        return
      }
      const completed = submitInspection(
        draft,
        typeof navigator !== "undefined" && !navigator.onLine
      )
      if (updateDraft(completed))
        window.location.assign(`/eho/inspections/${inspectionId}/result`)
      else setError("Unable to save the submission. Try again.")
    } catch {
      setError(
        "Unable to submit this inspection. Review your answers and try again."
      )
    }
  }
  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/eho/inspections/$inspectionId/checklist"
        params={{ inspectionId }}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Edit checklist
      </Link>
      <PageHeader
        eyebrow={`${inspectionId} · Final review`}
        title="Review & Submit"
        description={`${premises?.businessName ?? "Premises"} · Verify the field record before saving its result.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Inspection summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <p>
            <strong className="block">Checklist</strong>
            {
              checklist.filter((item) => draft.answers[item.id] !== undefined)
                .length
            }
            /{checklist.length} answered
          </p>
          <p>
            <strong className="block">Contraventions</strong>
            {draft.issues.length}
          </p>
          <p>
            <strong className="block">Evidence</strong>
            {draft.issues.filter((issue) => issue.evidence).length} file
            detail(s)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Attending officers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <label htmlFor="attending" className="text-sm text-muted-foreground">
            Confirm who attended, separated by commas. Assigned:{" "}
            {assignment.officers.join(", ")}.
          </label>
          <Input
            id="attending"
            className="min-h-11"
            value={draft.attendingOfficers.join(", ")}
            onChange={(event) =>
              updateDraft({
                ...draft,
                attendingOfficers: event.target.value
                  .split(",")
                  .map((name) => name.trim()),
              })
            }
          />
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {checklist.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">
                  {draft.answers[item.id] ?? "Unanswered"}
                </p>
                {draft.issues
                  .filter((issue) => issue.itemId === item.id)
                  .map((issue) => (
                    <p key={issue.id} className="mt-2 text-sm">
                      {issue.description} → {issue.action} · Due{" "}
                      {issue.deadline}
                    </p>
                  ))}
              </div>
              {draft.answers[item.id] === "Contravention" && (
                <Button
                  variant="link"
                  className="min-h-11"
                  nativeButton={false}
                  render={
                    <Link
                      to="/eho/inspections/$inspectionId/issues/$itemId"
                      params={{ inspectionId, itemId: item.id }}
                    />
                  }
                >
                  Edit issues
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {errors.length > 0 && (
        <Alert>
          <AlertDescription>
            <strong>Before submitting:</strong>
            <ul className="mt-2 list-inside list-disc">
              {errors.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3 border-t pt-5">
        <Button
          className="min-h-11"
          disabled={errors.length > 0}
          onClick={submit}
        >
          <ClipboardCheck />
          Submit inspection
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          nativeButton={false}
          render={
            <Link
              to="/eho/inspections/$inspectionId/checklist"
              params={{ inspectionId }}
            />
          }
        >
          Edit checklist
        </Button>
        <Button
          variant="ghost"
          className="min-h-11"
          nativeButton={false}
          render={
            <Link
              to="/eho/inspections/$inspectionId"
              params={{ inspectionId }}
            />
          }
        >
          Save draft
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        This inspection is saved on this device. A queued record has not reached
        the council.
      </p>
    </div>
  )
}

export function EhoResultPage({ inspectionId }: { inspectionId: string }) {
  const { assignment, premises } = contextFor(inspectionId)
  const { getDraft } = useEho()
  if (!assignment) return <EmptyState title="Inspection not found" />
  const draft = getDraft(inspectionId)
  if (draft.status === "draft")
    return (
      <div className="space-y-4">
        <EmptyState
          title="No submission yet"
          description="Complete the checklist and review it before opening a result."
        />
        <Button
          nativeButton={false}
          render={
            <Link
              to="/eho/inspections/$inspectionId/checklist"
              params={{ inspectionId }}
            />
          }
        >
          Return to checklist
        </Button>
      </div>
    )
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-7" />
      </div>
      <PageHeader
        eyebrow={inspectionId}
        title={
          draft.status === "queued"
            ? "Submission queued locally"
            : "Inspection captured"
        }
        description={`${premises?.businessName ?? "Premises"} · ${draft.submittedAt ? new Date(draft.submittedAt).toLocaleString() : "Saved on device"}`}
      />
      <Alert>
        <AlertDescription>
          {draft.status === "queued"
            ? "This inspection is saved on this device and has not reached the council."
            : "This inspection record is saved on this device. No findings notice has been served from it."}
        </AlertDescription>
      </Alert>
      <Card>
        <CardContent className="grid gap-4 p-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Checklist items</p>
            <p className="text-lg font-semibold">
              {checklist.length} completed
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Contraventions</p>
            <p className="text-lg font-semibold">
              {draft.issues.length} recorded
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Officer(s) attending</p>
            <p className="font-medium">{draft.attendingOfficers.join(", ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Local status</p>
            <StatusBadge status={draft.status} />
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button
          className="min-h-11"
          nativeButton={false}
          render={<Link to="/eho/my-work" />}
        >
          Back to My Work
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          nativeButton={false}
          render={
            <Link
              to="/eho/inspections/$inspectionId"
              params={{ inspectionId }}
            />
          }
        >
          View inspection
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
      <p className="text-sm text-muted-foreground">
        A findings notice has not been served from this record.
      </p>
    </div>
  )
}
