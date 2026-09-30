import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { assignments, checklist } from "./eho-model"
import type {
  ChecklistItem,
  Evidence,
  InspectionAnswer,
  Issue,
} from "./eho-model"
import {
  canStart,
  reviewErrors,
  saveAnswer,
  saveIssue,
  submitInspection,
} from "./eho-state"
import { useEho } from "./eho-session"
import { inspectionCheckComplete } from "./eho-inspection-journey"
import { readTaskProgress } from "./eho-task-progress"

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

function noticeHasBeenServed(
  inspectionId: string,
  officerId: string | undefined
) {
  const assignment = assignments.find((item) => item.id === inspectionId)
  if (!assignment) return false
  if (assignment.notice === "Served") return true
  if (!officerId || typeof window === "undefined") return false
  return Boolean(
    readTaskProgress(localStorage, officerId, assignment).noticeSentAt
  )
}

function evidenceKind(type: string) {
  if (type.startsWith("image/")) return "Image"
  if (type.startsWith("video/")) return "Video"
  if (type === "application/pdf") return "PDF"
  return "File"
}

function fileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function EvidenceUploadField({
  id,
  evidence,
  onChange,
}: {
  id: string
  evidence: Evidence[]
  onChange: (evidence: Evidence[]) => void
}) {
  function addFiles(files: FileList | null) {
    if (!files) return
    const additions = Array.from(files, (file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    }))
    const unique = [...evidence]
    for (const file of additions) {
      if (
        !unique.some(
          (existing) =>
            existing.name === file.name &&
            existing.type === file.type &&
            existing.size === file.size
        )
      )
        unique.push(file)
    }
    onChange(unique)
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>Evidence files</FieldLabel>
      <Input
        id={id}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        className="h-auto py-2"
        onChange={(event) => {
          addFiles(event.currentTarget.files)
          event.currentTarget.value = ""
        }}
      />
      <FieldDescription>Add multiple images, videos, or PDFs.</FieldDescription>
      {evidence.length > 0 && (
        <div
          className="overflow-hidden rounded-lg border"
          aria-label={`${evidence.length} selected evidence ${evidence.length === 1 ? "file" : "files"}`}
        >
          <div className="flex items-center justify-between gap-3 bg-muted/40 px-3 py-2">
            <p className="text-sm font-medium">Selected evidence</p>
            <Badge variant="secondary">{evidence.length}</Badge>
          </div>
          <ul className="divide-y">
            {evidence.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {evidenceKind(file.type)} · {fileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() =>
                    onChange(
                      evidence.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Field>
  )
}

function ContraventionDialog({
  inspectionId,
  item,
  hasIssues,
  noticeServed,
  onSaved,
}: {
  inspectionId: string
  item: ChecklistItem
  hasIssues: boolean
  noticeServed: boolean
  onSaved: () => void
}) {
  const { getDraft, updateDraft } = useEho()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [action, setAction] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [error, setError] = useState("")

  function resetForm() {
    setDescription("")
    setAction("")
    setDeadline("")
    setNotes("")
    setEvidence([])
    setError("")
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) resetForm()
  }

  function save(event: React.FormEvent) {
    event.preventDefault()
    if (!description.trim() || !action.trim() || !deadline) {
      setError("Describe the issue, required corrective action, and deadline.")
      return
    }

    const issue: Issue = {
      id: crypto.randomUUID(),
      itemId: item.id,
      description: description.trim(),
      action: action.trim(),
      deadline,
      notes: notes.trim(),
      evidence,
    }
    if (!updateDraft(saveIssue(getDraft(inspectionId), issue, noticeServed))) {
      setError("Could not save this issue. Try again.")
      return
    }

    onSaved()
    handleOpenChange(false)
  }

  const fieldId = `contravention-${item.id}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant={hasIssues ? "outline" : "default"}
            className="min-h-11"
          />
        }
      >
        {hasIssues ? "Add another" : "Report contravention"}
      </DialogTrigger>
      <DialogContent className="h-[min(42rem,calc(100dvh-2rem))] overflow-hidden sm:max-w-xl">
        <form
          onSubmit={save}
          className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]"
        >
          <DialogHeader className="gap-1">
            <DialogTitle>Report contravention</DialogTitle>
            <DialogDescription>
              {item.label} · Record the issue, corrective action, and deadline.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="min-h-0 [scrollbar-width:none] gap-4 overflow-y-auto overscroll-contain py-4 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>[data-slot=field]]:gap-2">
            <Field data-invalid={Boolean(error && !description.trim())}>
              <FieldLabel htmlFor={`${fieldId}-description`}>
                Description of issue
              </FieldLabel>
              <Textarea
                id={`${fieldId}-description`}
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  setError("")
                }}
                aria-invalid={Boolean(error && !description.trim())}
                rows={2}
                className="min-h-14"
                required
              />
            </Field>
            <Field data-invalid={Boolean(error && !action.trim())}>
              <FieldLabel htmlFor={`${fieldId}-action`}>
                Required corrective action
              </FieldLabel>
              <Textarea
                id={`${fieldId}-action`}
                value={action}
                onChange={(event) => {
                  setAction(event.target.value)
                  setError("")
                }}
                aria-invalid={Boolean(error && !action.trim())}
                rows={2}
                className="min-h-14"
                required
              />
            </Field>
            <Field data-invalid={Boolean(error && !deadline)}>
              <FieldLabel htmlFor={`${fieldId}-deadline`}>Deadline</FieldLabel>
              <Input
                id={`${fieldId}-deadline`}
                type="date"
                value={deadline}
                onChange={(event) => {
                  setDeadline(event.target.value)
                  setError("")
                }}
                aria-invalid={Boolean(error && !deadline)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${fieldId}-notes`}>
                Additional notes (optional)
              </FieldLabel>
              <Textarea
                id={`${fieldId}-notes`}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                className="min-h-14"
              />
            </Field>
            <EvidenceUploadField
              id={`${fieldId}-evidence`}
              evidence={evidence}
              onChange={setEvidence}
            />
            <FieldError>{error}</FieldError>
          </FieldGroup>
          <DialogFooter className="border-t pt-4">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Save contravention</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EhoChecklistPage({
  inspectionId,
  itemId,
}: {
  inspectionId: string
  itemId?: string
}) {
  const { assignment, premises } = contextFor(inspectionId)
  const { officer, getDraft, updateDraft } = useEho()
  const [message, setMessage] = useState("")
  if (!assignment) return <EmptyState title="Inspection not found" />
  const itemIndex = itemId
    ? checklist.findIndex((item) => item.id === itemId)
    : 0
  const activeItem = checklist.at(itemIndex)
  if (!activeItem) return <EmptyState title="Checklist item not found" />
  const draft = getDraft(inspectionId)
  const noticeServed = noticeHasBeenServed(inspectionId, officer?.id)
  if (!canStart(assignment, noticeServed) || draft.status !== "draft")
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            {!canStart(assignment, noticeServed)
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
  const currentComplete = inspectionCheckComplete(draft, activeItem.id)
  const previousItem = itemIndex > 0 ? checklist.at(itemIndex - 1) : undefined
  const nextItem = checklist.at(itemIndex + 1)
  const previousLink = previousItem ? (
    <Link
      to="/eho/inspections/$inspectionId/checklist/$itemId"
      params={{ inspectionId, itemId: previousItem.id }}
    />
  ) : (
    <Link to="/eho/inspections/$inspectionId" params={{ inspectionId }} />
  )
  const nextLink = nextItem ? (
    <Link
      to="/eho/inspections/$inspectionId/checklist/$itemId"
      params={{ inspectionId, itemId: nextItem.id }}
    />
  ) : (
    <Link
      to="/eho/inspections/$inspectionId/review"
      params={{ inspectionId }}
    />
  )
  return (
    <div className="mx-auto max-w-[43rem] space-y-6">
      <PageHeader
        eyebrow={`${inspectionId} · Field checklist`}
        title={premises?.businessName ?? "Inspection checklist"}
        description="Choose one answer for each check. Changes save to this device as you work."
        divided={false}
      />
      <Card>
        <CardHeader>
          <CardTitle>{activeItem.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">
              Assessment
              <span className="sr-only"> for {activeItem.label}</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {answers.map((answer) => (
                <label
                  key={answer}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border p-3 text-sm focus-within:ring-2 focus-within:ring-ring ${draft.answers[activeItem.id] === answer ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/50"}`}
                >
                  <input
                    type="radio"
                    name={`answer-${activeItem.id}`}
                    value={answer}
                    checked={draft.answers[activeItem.id] === answer}
                    onChange={() => {
                      if (
                        !updateDraft(
                          saveAnswer(draft, activeItem.id, answer, noticeServed)
                        )
                      )
                        setMessage("Unable to save this answer. Try again.")
                      else setMessage("Saved on this device")
                    }}
                  />
                  {answer}
                </label>
              ))}
            </div>
          </fieldset>
          {draft.answers[activeItem.id] &&
            draft.answers[activeItem.id] !== "Contravention" && (
              <div className="grid gap-2">
                <label
                  htmlFor={`note-${activeItem.id}`}
                  className="text-sm font-medium"
                >
                  Notes (optional)
                </label>
                <Textarea
                  id={`note-${activeItem.id}`}
                  value={draft.notes[activeItem.id] ?? ""}
                  onChange={(event) =>
                    updateDraft({
                      ...draft,
                      notes: {
                        ...draft.notes,
                        [activeItem.id]: event.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
          {draft.answers[activeItem.id] === "Contravention" && (
            <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-950">
                {draft.issues.filter((issue) => issue.itemId === activeItem.id)
                  .length === 1
                  ? "1 issue recorded."
                  : `${draft.issues.filter((issue) => issue.itemId === activeItem.id).length} issues recorded.`}{" "}
                Add a corrective action and deadline.
              </p>
              <div className="flex flex-wrap gap-2">
                {draft.issues.some(
                  (issue) => issue.itemId === activeItem.id
                ) && (
                  <Button
                    className="min-h-11"
                    nativeButton={false}
                    render={
                      <Link
                        to="/eho/inspections/$inspectionId/issues/$itemId"
                        params={{ inspectionId, itemId: activeItem.id }}
                      />
                    }
                  >
                    Review and edit
                  </Button>
                )}
                <ContraventionDialog
                  inspectionId={inspectionId}
                  item={activeItem}
                  hasIssues={draft.issues.some(
                    (issue) => issue.itemId === activeItem.id
                  )}
                  noticeServed={noticeServed}
                  onSaved={() =>
                    setMessage("Contravention saved on this device")
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <Button
          variant="outline"
          className="min-h-11"
          nativeButton={false}
          render={previousLink}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back
        </Button>
        {currentComplete ? (
          <Button className="min-h-11" nativeButton={false} render={nextLink}>
            {nextItem ? "Next" : "Review inspection"}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        ) : (
          <Button className="min-h-11" disabled>
            {nextItem ? "Next" : "Review inspection"}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        )}
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
  const { officer, getDraft, updateDraft } = useEho()
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState("")
  const [description, setDescription] = useState("")
  const [action, setAction] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [error, setError] = useState("")
  if (!assignment || !item)
    return <EmptyState title="Checklist item not found" />
  const draft = getDraft(inspectionId)
  const noticeServed = noticeHasBeenServed(inspectionId, officer?.id)
  if (!canStart(assignment, noticeServed) || draft.status !== "draft")
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
    setEvidence(issue.evidence ?? [])
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
    if (!updateDraft(saveIssue(draft, issue, noticeServed))) {
      setError("Could not save this issue. Try again.")
      return
    }
    if (itemId === "food-storage")
      void navigate({
        to: "/eho/inspections/$inspectionId/checklist",
        params: { inspectionId },
      })
    else
      void navigate({
        to: "/eho/inspections/$inspectionId/checklist/$itemId",
        params: { inspectionId, itemId },
      })
  }
  return (
    <div className="max-w-3xl space-y-6">
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
            <EvidenceUploadField
              id="issue-evidence"
              evidence={evidence}
              onChange={setEvidence}
            />
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
                  itemId === "food-storage" ? (
                    <Link
                      to="/eho/inspections/$inspectionId/checklist"
                      params={{ inspectionId }}
                    />
                  ) : (
                    <Link
                      to="/eho/inspections/$inspectionId/checklist/$itemId"
                      params={{ inspectionId, itemId }}
                    />
                  )
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
  const { officer, getDraft, updateDraft } = useEho()
  const [error, setError] = useState("")
  if (!assignment) return <EmptyState title="Inspection not found" />
  const draft = getDraft(inspectionId)
  const noticeServed = noticeHasBeenServed(inspectionId, officer?.id)
  if (!canStart(assignment, noticeServed) || draft.status !== "draft")
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
        typeof navigator !== "undefined" && !navigator.onLine,
        undefined,
        noticeServed
      )
      if (updateDraft(completed))
        window.location.assign(`/eho/inspections/${inspectionId}`)
      else setError("Unable to save the submission. Try again.")
    } catch {
      setError(
        "Unable to submit this inspection. Review your answers and try again."
      )
    }
  }
  return (
    <div className="max-w-4xl space-y-6">
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
            {draft.issues.reduce(
              (count, issue) => count + (issue.evidence?.length ?? 0),
              0
            )}{" "}
            file detail(s)
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
