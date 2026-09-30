import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { CheckCircle2, ClipboardList } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { assignments, checklist } from "./eho-model"
import type { Issue } from "./eho-model"
import {
  completeFollowUp,
  createFollowUp,
  followUpErrors,
  followUpOutcome,
  followUpScenarios,
  readFollowUp,
  saveFollowUp,
} from "./eho-follow-up"
import type { FollowUpRecord, Verification } from "./eho-follow-up"
import { useEho } from "./eho-session"

function useSource(inspectionId: string) {
  const { getDraft } = useEho()
  const assignment = assignments.find((item) => item.id === inspectionId)
  const premises = seedDatabase.premises.find(
    (item) => item.id === assignment?.premisesId
  )
  return {
    assignment,
    premises,
    source: assignment ? getDraft(inspectionId) : null,
  }
}

export function EhoFindingsPage({ inspectionId }: { inspectionId: string }) {
  const { assignment, premises, source } = useSource(inspectionId)
  if (!assignment || !source) return <EmptyState title="Inspection not found" />
  if (source.status === "draft")
    return (
      <EmptyState
        title="No captured result yet"
        description="Finish and submit the inspection before reviewing findings."
      />
    )
  const scenario = followUpScenarios[inspectionId]
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={`${inspectionId} · Local findings`}
        title="Findings summary"
        description={`${premises?.businessName ?? "Premises"} · ${source.issues.length} contravention${source.issues.length === 1 ? "" : "s"} captured`}
      />
      <Alert>
        <AlertDescription>
          This summary contains the findings captured for the inspection. A
          findings notice has not been served from this record.
        </AlertDescription>
      </Alert>
      {!source.issues.length ? (
        <EmptyState
          title="No findings notice required"
          description="No contraventions were recorded for this inspection."
        />
      ) : (
        <div className="space-y-4">
          {source.issues.map((issue, index) => (
            <Card key={issue.id}>
              <CardHeader>
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Finding {index + 1} ·{" "}
                  {checklist.find((item) => item.id === issue.itemId)?.label ??
                    "Inspection item"}
                </p>
                <CardTitle>{issue.description}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Required correction</p>
                  <p className="mt-1">{issue.action}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Original deadline</p>
                  <p className="mt-1 font-medium">{issue.deadline}</p>
                </div>
                {issue.notes && <p className="sm:col-span-2">{issue.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {source.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Follow-up readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              {scenario
                ? `Follow-up ${scenario.reference} · ${scenario.scheduledAt} · Notice ${scenario.notice.toLowerCase()}`
                : "No follow-up visit has been assigned."}
            </p>
            {source.status === "queued" && (
              <p className="text-muted-foreground">
                The source inspection is queued on this device. Follow-up cannot
                start yet.
              </p>
            )}
            {source.status === "submitted" && scenario?.notice === "Served" && (
              <Button
                className="min-h-11"
                nativeButton={false}
                render={
                  <Link
                    to="/eho/inspections/$inspectionId/follow-up"
                    params={{ inspectionId }}
                  />
                }
              >
                Open follow-up
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const verificationOptions: Verification[] = [
  "Resolved",
  "Still outstanding",
  "Unable to verify",
]

export function EhoFollowUpPage({ inspectionId }: { inspectionId: string }) {
  const { officer } = useEho()
  const { assignment, premises, source } = useSource(inspectionId)
  const scenario = followUpScenarios[inspectionId]
  const [record, setRecord] = useState<FollowUpRecord>(() =>
    createFollowUp(inspectionId)
  )
  const [hydrated, setHydrated] = useState(false)
  const [message, setMessage] = useState("")
  const [description, setDescription] = useState("")
  const [action, setAction] = useState("")
  const [deadline, setDeadline] = useState("")

  useEffect(() => {
    if (officer) setRecord(readFollowUp(localStorage, officer.id, inspectionId))
    setHydrated(true)
  }, [inspectionId, officer])

  if (!assignment || !source) return <EmptyState title="Inspection not found" />
  if (source.status !== "submitted" || !source.issues.length || !scenario)
    return (
      <EmptyState
        title="No assigned follow-up"
        description="A submitted inspection with findings and an assigned follow-up is required."
      />
    )
  if (scenario.notice !== "Served")
    return (
      <Alert>
        <AlertDescription>
          The follow-up notice must be served before field verification can
          begin.
        </AlertDescription>
      </Alert>
    )
  if (!hydrated) return <p role="status">Loading follow-up draft…</p>

  function persist(
    next: FollowUpRecord,
    success = "Saved on this device",
    preserveOnFailure = false
  ) {
    if (!officer) return false
    try {
      saveFollowUp(localStorage, officer.id, next)
      setRecord(next)
      setMessage(success)
      return true
    } catch {
      if (preserveOnFailure) setRecord(next)
      setMessage(
        "Could not save this follow-up. Keep this page open and try again."
      )
      return false
    }
  }

  function addIssue() {
    if (!description.trim() || !action.trim() || !deadline) {
      setMessage("Describe the new issue, its correction, and deadline.")
      return
    }
    const issue: Issue = {
      id: `FU-${Date.now()}`,
      itemId: "follow-up",
      description: description.trim(),
      action: action.trim(),
      deadline,
      notes: "",
    }
    const saved = persist(
      { ...record, newIssues: [...record.newIssues, issue] },
      "New contravention saved locally"
    )
    if (saved) {
      setDescription("")
      setAction("")
      setDeadline("")
    }
  }

  const errors = followUpErrors(record, source, true)
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <PageHeader
        eyebrow={`${scenario.reference} · ${scenario.scheduledAt}`}
        title="Follow-up verification"
        description={`${premises?.businessName ?? "Premises"} · Check each previous corrective action.`}
      />
      <Alert>
        <AlertDescription>
          This is a seeded follow-up scenario. Verification is stored on this
          device; it does not deliver a council decision.
        </AlertDescription>
      </Alert>
      {record.status === "completed" ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <CheckCircle2
              className="size-8 text-emerald-700"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold">Follow-up captured</h2>
            <p>{followUpOutcome(record)}</p>
            <p className="text-sm text-muted-foreground">
              Completed locally{" "}
              {record.completedAt
                ? new Date(record.completedAt).toLocaleString()
                : ""}
              . No official notice or certificate decision was issued.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {source.issues.map((issue, index) => (
              <Card key={issue.id}>
                <CardHeader>
                  <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                    Previous issue {index + 1}
                  </p>
                  <CardTitle>{issue.description}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>
                    <span className="text-muted-foreground">
                      Required correction ·{" "}
                    </span>
                    {issue.action}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Original deadline ·{" "}
                    </span>
                    {issue.deadline}
                  </p>
                  <fieldset className="space-y-2">
                    <legend className="font-medium">Verification result</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {verificationOptions.map((option) => (
                        <label
                          key={option}
                          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border p-3 focus-within:ring-2 focus-within:ring-ring"
                        >
                          <input
                            type="radio"
                            name={`verification-${issue.id}`}
                            checked={
                              record.verifications[issue.id]?.result === option
                            }
                            onChange={() =>
                              persist(
                                {
                                  ...record,
                                  verifications: {
                                    ...record.verifications,
                                    [issue.id]: {
                                      result: option,
                                      note:
                                        record.verifications[issue.id]?.note ??
                                        "",
                                    },
                                  },
                                },
                                "Saved on this device",
                                true
                              )
                            }
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="space-y-2">
                    <label htmlFor={`note-${issue.id}`} className="font-medium">
                      Verification note
                    </label>
                    <Textarea
                      id={`note-${issue.id}`}
                      value={record.verifications[issue.id]?.note ?? ""}
                      onChange={(event) => {
                        const current = record.verifications[issue.id]
                        if (!current) return
                        persist(
                          {
                            ...record,
                            verifications: {
                              ...record.verifications,
                              [issue.id]: {
                                ...current,
                                note: event.target.value,
                              },
                            },
                          },
                          "Saved on this device",
                          true
                        )
                      }}
                      placeholder="What did you observe?"
                      disabled={!record.verifications[issue.id]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>New contravention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add an issue discovered during this follow-up, if needed.
              </p>
              {record.newIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{issue.description}</p>
                    <p>
                      {issue.action} · Due {issue.deadline}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() =>
                      persist({
                        ...record,
                        newIssues: record.newIssues.filter(
                          (item) => item.id !== issue.id
                        ),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <label
                    htmlFor="follow-up-description"
                    className="text-sm font-medium"
                  >
                    Issue description
                  </label>
                  <Textarea
                    id="follow-up-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="follow-up-action"
                    className="text-sm font-medium"
                  >
                    Required correction
                  </label>
                  <Textarea
                    id="follow-up-action"
                    value={action}
                    onChange={(event) => setAction(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="follow-up-deadline"
                    className="text-sm font-medium"
                  >
                    Deadline
                  </label>
                  <Input
                    id="follow-up-deadline"
                    type="date"
                    value={deadline}
                    onChange={(event) => setDeadline(event.target.value)}
                    className="min-h-11"
                  />
                </div>
                <Button
                  variant="outline"
                  className="min-h-11 justify-self-start"
                  onClick={addIssue}
                >
                  Add new contravention
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Review follow-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="flex items-center gap-2 text-sm">
                <ClipboardList className="size-4" aria-hidden="true" />
                {source.issues.length -
                  errors.filter((error) => error.startsWith("Verify "))
                    .length}{" "}
                of {source.issues.length} previous issues verified ·{" "}
                {record.newIssues.length} new
              </p>
              {errors.length > 0 && (
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
              <Button
                className="min-h-11"
                disabled={errors.length > 0}
                onClick={() => {
                  try {
                    persist(
                      completeFollowUp(record, source, true),
                      "Follow-up captured on this device"
                    )
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Could not complete follow-up."
                    )
                  }
                }}
              >
                Complete follow-up locally
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      <Button
        variant="outline"
        className="min-h-11"
        nativeButton={false}
        render={
          <Link to="/eho/inspections/$inspectionId" params={{ inspectionId }} />
        }
      >
        View previous inspection
      </Button>
    </div>
  )
}
