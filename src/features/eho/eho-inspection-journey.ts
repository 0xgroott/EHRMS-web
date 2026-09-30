import { checklist } from "./eho-model"
import type { Fieldwork } from "./eho-model"
import type { InspectionTaskProgress } from "./eho-task-progress"

export type InspectionJourneyStepId =
  | "food-storage"
  | "waste-control"
  | "water-supply"
  | "review"
  | "submit"
  | "resolve"
  | "close"

export interface InspectionJourneyStep {
  id: InspectionJourneyStepId
  label: string
  description: string
  status: "complete" | "current" | "upcoming"
  href?: string
}

interface InspectionJourneyInput {
  inspectionId: string
  pathname: string
  progress: InspectionTaskProgress
  draft: Fieldwork
  followUpRequired: boolean
  followUpCompleted: boolean
}

export function inspectionCheckComplete(draft: Fieldwork, itemId: string) {
  const answer = draft.answers[itemId]
  if (!answer) return false
  if (answer !== "Contravention") return true
  return draft.issues.some(
    (issue) =>
      issue.itemId === itemId &&
      issue.description.trim() &&
      issue.action.trim() &&
      issue.deadline.trim()
  )
}

function routeStep(pathname: string) {
  if (/\/follow-up\/?$/.test(pathname) || /\/findings\/?$/.test(pathname))
    return 5
  if (/\/result\/?$/.test(pathname)) return 4
  if (/\/review\/?$/.test(pathname)) return 3
  const itemId = pathname.match(/\/checklist\/([^/]+)\/?$/)?.[1]
  const itemIndex = checklist.findIndex((item) => item.id === itemId)
  return itemIndex >= 0 ? itemIndex : 0
}

export function inspectionJourney({
  inspectionId,
  pathname,
  progress,
  draft,
  followUpRequired,
  followUpCompleted,
}: InspectionJourneyInput) {
  const base = `/eho/inspections/${inspectionId}`
  const checkCompletion = checklist.map((item) =>
    inspectionCheckComplete(draft, item.id)
  )
  const inspectionReady = checkCompletion.every(Boolean)
  const submitted = draft.status !== "draft"
  const hasFindings = draft.issues.length > 0
  const findingsResolved =
    submitted && (!hasFindings || !followUpRequired || followUpCompleted)
  const completed = [
    ...checkCompletion.map((complete) => submitted || complete),
    submitted,
    submitted,
    findingsResolved,
    Boolean(progress.completedAt),
  ]
  const activeIndex = progress.completedAt ? 6 : routeStep(pathname)

  const definitions: Array<
    Omit<InspectionJourneyStep, "status" | "href"> & {
      href?: string
      available: boolean
    }
  > = [
    ...checklist.map((item, index) => ({
      id: item.id as InspectionJourneyStepId,
      label: item.label,
      description: item.section,
      href: index === 0 ? `${base}/checklist` : `${base}/checklist/${item.id}`,
      available:
        index === 0 ||
        checkCompletion.slice(0, index).every(Boolean) ||
        activeIndex === index,
    })),
    {
      id: "review",
      label: "Review inspection",
      description: "Verify findings and attending officers",
      href: `${base}/review`,
      available: inspectionReady || submitted || activeIndex >= 3,
    },
    {
      id: "submit",
      label: "Submit record",
      description: "Save or queue the inspection result",
      href: `${base}/result`,
      available: submitted || activeIndex >= 4,
    },
    {
      id: "resolve",
      label: "Resolve findings",
      description: hasFindings
        ? "Findings notice and follow-up work"
        : "No follow-up required",
      href: hasFindings ? `${base}/findings` : undefined,
      available: (submitted && hasFindings) || activeIndex >= 5,
    },
    {
      id: "close",
      label: "Close task",
      description: "Return to the overview and finish the assignment",
      href: base,
      available: findingsResolved || Boolean(progress.completedAt),
    },
  ]

  const steps = definitions.map(({ available, href, ...step }, index) => ({
    ...step,
    status:
      index === activeIndex
        ? ("current" as const)
        : completed[index]
          ? ("complete" as const)
          : ("upcoming" as const),
    href: available ? href : undefined,
  }))

  const activeCheck =
    activeIndex < checklist.length ? checklist[activeIndex] : null
  let guidance = activeCheck
    ? `Complete the ${activeCheck.label.toLowerCase()} assessment before continuing.`
    : "Review the completed field record and submit it."
  if (progress.completedAt)
    guidance =
      "This inspection task is closed and remains available as a record."
  else if (draft.status === "queued")
    guidance = "Sync the queued inspection record before closing this task."
  else if (submitted && hasFindings && followUpRequired && !followUpCompleted)
    guidance =
      "Review the findings notice and complete the required follow-up inspection."
  else if (submitted)
    guidance = "Return to the inspection overview and submit the task as done."
  else if (inspectionReady)
    guidance =
      "Review the completed field record, confirm attending officers, and submit it."

  return {
    steps,
    active: steps[activeIndex],
    completedCount: completed.filter(Boolean).length,
    guidance,
  }
}
