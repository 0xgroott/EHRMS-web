import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Check, CircleHelp } from "lucide-react"
import { cn } from "cn"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  FOLLOW_UP_PROGRESS_EVENT,
  followUpScenarios,
  readFollowUp,
} from "./eho-follow-up"
import type { FollowUpRecord } from "./eho-follow-up"
import { inspectionJourney } from "./eho-inspection-journey"
import { assignments } from "./eho-model"
import { useEho } from "./eho-session"
import {
  createTaskProgress,
  readTaskProgress,
  TASK_PROGRESS_EVENT,
} from "./eho-task-progress"
import type { InspectionTaskProgress } from "./eho-task-progress"

export function EhoInspectionJourneyLayout({
  inspectionId,
  pathname,
  children,
}: {
  inspectionId: string
  pathname: string
  children: ReactNode
}) {
  const assignment = assignments.find((item) => item.id === inspectionId)
  const { officer, getDraft } = useEho()
  const draft = assignment ? getDraft(inspectionId) : null
  const [progress, setProgress] = useState<InspectionTaskProgress | null>(null)
  const [followUp, setFollowUp] = useState<FollowUpRecord | null>(null)

  useEffect(() => {
    if (!assignment || !officer) return
    const load = () => {
      setProgress(readTaskProgress(localStorage, officer.id, assignment))
      setFollowUp(readFollowUp(localStorage, officer.id, inspectionId))
    }
    const onTaskProgress = (event: Event) => {
      const next = (event as CustomEvent<InspectionTaskProgress>).detail
      if (next.assignmentId === inspectionId) setProgress(next)
    }
    const onFollowUpProgress = (event: Event) => {
      const next = (event as CustomEvent<FollowUpRecord>).detail
      if (next.sourceId === inspectionId) setFollowUp(next)
    }
    load()
    window.addEventListener(TASK_PROGRESS_EVENT, onTaskProgress)
    window.addEventListener(FOLLOW_UP_PROGRESS_EVENT, onFollowUpProgress)
    return () => {
      window.removeEventListener(TASK_PROGRESS_EVENT, onTaskProgress)
      window.removeEventListener(FOLLOW_UP_PROGRESS_EVENT, onFollowUpProgress)
    }
  }, [assignment, inspectionId, officer])

  if (!assignment || !draft) return children

  const currentProgress = progress ?? createTaskProgress(assignment)
  const followUpRequired =
    draft.status === "submitted" &&
    draft.issues.length > 0 &&
    Boolean(followUpScenarios[inspectionId])
  const journey = inspectionJourney({
    inspectionId,
    pathname,
    progress: currentProgress,
    draft,
    followUpRequired,
    followUpCompleted: followUp?.status === "completed",
  })
  const base = `/eho/inspections/${inspectionId}`
  const exitButton = (
    <Button
      variant="outline"
      nativeButton={false}
      className="min-h-11 w-fit bg-background shadow-xs"
      render={<Link to={base} />}
    >
      <ArrowLeft data-icon="inline-start" aria-hidden="true" />
      Save and exit
    </Button>
  )

  return (
    <div className="grid min-h-svh xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="order-2 min-w-0 px-4 pt-6 pb-20 md:px-8 md:pt-8 md:pb-24 xl:order-1 xl:px-12">
        <div className="hidden xl:block">{exitButton}</div>
        <div className="mx-auto mt-10 max-w-[43rem] xl:mt-[clamp(4rem,10vh,8rem)]">
          {children}
        </div>
      </section>
      <aside
        aria-label="Inspection progress"
        className="order-1 px-4 pt-4 md:px-8 md:pt-8 xl:sticky xl:top-0 xl:order-2 xl:h-svh xl:overflow-y-auto xl:border-l xl:bg-background xl:px-6 xl:py-8"
      >
        <div className="mb-4 xl:hidden">{exitButton}</div>
        <Card size="sm" className="xl:hidden">
          <CardHeader>
            <CardTitle>Inspection guide</CardTitle>
            <CardDescription>
              Current step: {journey.active.label}
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">
                {journey.completedCount}/{journey.steps.length}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${(journey.completedCount / journey.steps.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {journey.guidance}
            </p>
          </CardContent>
        </Card>

        <div className="hidden min-h-full flex-col xl:flex">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Inspection guide
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {assignment.id}
              </p>
            </div>
            <Badge variant="secondary">
              {journey.completedCount} of {journey.steps.length}
            </Badge>
          </div>
          <Separator className="my-6" />
          <ol aria-label="Inspection steps" className="flex flex-col gap-2">
            {journey.steps.map((step, index) => {
              const active = step.id === journey.active.id
              const content = (
                <>
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      step.status === "complete"
                        ? "border-primary bg-primary text-primary-foreground"
                        : active
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                    )}
                  >
                    {step.status === "complete" ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-medium">
                      {step.label}
                    </span>
                  </span>
                </>
              )

              return (
                <li key={step.id} aria-current={active ? "step" : undefined}>
                  {step.href ? (
                    <Button
                      variant="ghost"
                      nativeButton={false}
                      className={cn(
                        "h-auto min-h-16 w-full justify-start gap-3 px-3 py-2 whitespace-normal",
                        active && "bg-primary/10 hover:bg-primary/10"
                      )}
                      render={<Link to={step.href} />}
                    >
                      {content}
                    </Button>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex min-h-16 items-center gap-3 px-3 py-2 text-muted-foreground"
                    >
                      {content}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
          <Card size="sm" className="mt-8 xl:mt-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleHelp
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                What happens next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {journey.guidance}
              </p>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  )
}
