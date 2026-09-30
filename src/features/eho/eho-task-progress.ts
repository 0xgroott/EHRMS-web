import type { Assignment, Fieldwork } from "./eho-model"
import { noticeFor } from "./eho-notice"

export interface InspectionTaskProgress {
  assignmentId: string
  noticeSentAt?: string
  acknowledgedAt?: string
  appointmentDate?: string
  followUpStartedAt?: string
  completedAt?: string
}

export type InspectionTaskActionId =
  | "send-notice"
  | "await-acknowledgement"
  | "schedule-appointment"
  | "start-inspection"
  | "continue-inspection"
  | "start-follow-up"
  | "continue-follow-up"
  | "submit-work"
  | "completed"

export interface InspectionTaskAction {
  id: InspectionTaskActionId
  label: string
  disabled: boolean
  reason: string
}

const STORAGE_PREFIX = "ehrcms:eho:task-progress:v1:"
export const TASK_PROGRESS_EVENT = "ehrcms:eho-task-progress"

export function createTaskProgress(
  assignment: Assignment
): InspectionTaskProgress {
  const notice = noticeFor(assignment)
  return {
    assignmentId: assignment.id,
    noticeSentAt: notice?.servedAt,
    acknowledgedAt: notice?.acknowledgedAt,
    appointmentDate: notice?.acknowledgedAt
      ? assignment.scheduledAt
      : undefined,
  }
}

export function sendInspectionNotice(
  progress: InspectionTaskProgress,
  sentAt = new Date().toISOString()
): InspectionTaskProgress {
  if (progress.noticeSentAt) return progress
  return { ...progress, noticeSentAt: sentAt }
}

export function acknowledgeInspectionNotice(
  progress: InspectionTaskProgress,
  acknowledgedAt = new Date().toISOString()
): InspectionTaskProgress {
  if (!progress.noticeSentAt || progress.acknowledgedAt) return progress
  return { ...progress, acknowledgedAt }
}

export function resetTaskProgress(
  assignmentId: string
): InspectionTaskProgress {
  return { assignmentId }
}

export function earliestAppointmentDate(
  progress: InspectionTaskProgress
): string | null {
  if (!progress.acknowledgedAt) return null
  const date = new Date(progress.acknowledgedAt)
  if (Number.isNaN(date.getTime())) return null
  date.setUTCDate(date.getUTCDate() + 7)
  return date.toISOString().slice(0, 10)
}

export function scheduleAppointment(
  progress: InspectionTaskProgress,
  appointmentDate: string
): InspectionTaskProgress {
  const earliest = earliestAppointmentDate(progress)
  if (!earliest)
    throw new Error("Business acknowledgement is required before scheduling.")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate))
    throw new Error("Choose a valid appointment date.")
  if (appointmentDate < earliest)
    throw new Error(
      `The appointment must be at least seven days after acknowledgement (${earliest} or later).`
    )
  return { ...progress, appointmentDate }
}

export function startFollowUp(
  progress: InspectionTaskProgress,
  startedAt = new Date().toISOString()
): InspectionTaskProgress {
  if (progress.followUpStartedAt) return progress
  return { ...progress, followUpStartedAt: startedAt }
}

export function nextTaskAction(
  progress: InspectionTaskProgress,
  fieldwork: Fieldwork,
  followUpRequired: boolean,
  followUpCompleted: boolean
): InspectionTaskAction {
  if (progress.completedAt)
    return {
      id: "completed",
      label: "Work submitted as done",
      disabled: true,
      reason: "This inspection task is complete.",
    }
  if (!progress.noticeSentAt)
    return {
      id: "send-notice",
      label: "Send notice",
      disabled: false,
      reason: "Notify the business before arranging the inspection.",
    }
  if (!progress.acknowledgedAt)
    return {
      id: "await-acknowledgement",
      label: "Awaiting business acknowledgement",
      disabled: true,
      reason:
        "The business must acknowledge the notice in its portal before an appointment can be scheduled.",
    }
  if (!progress.appointmentDate)
    return {
      id: "schedule-appointment",
      label: "Schedule appointment",
      disabled: false,
      reason: "Choose a visit date at least seven days after acknowledgement.",
    }
  if (fieldwork.status === "draft") {
    const started = Object.keys(fieldwork.answers).length > 0
    return {
      id: started ? "continue-inspection" : "start-inspection",
      label: started ? "Continue inspection" : "Start inspection",
      disabled: false,
      reason: started
        ? "Continue the saved inspection checklist."
        : `The premises visit is scheduled for ${progress.appointmentDate}.`,
    }
  }
  if (fieldwork.status === "queued")
    return {
      id: "submit-work",
      label: "Submit work as done",
      disabled: true,
      reason: "Sync the inspection result before closing this task.",
    }
  if (followUpRequired && !followUpCompleted)
    return {
      id: progress.followUpStartedAt ? "continue-follow-up" : "start-follow-up",
      label: progress.followUpStartedAt
        ? "Continue follow-up inspection"
        : "Start follow-up inspection",
      disabled: false,
      reason:
        "A follow-up is required before this task can be submitted as done.",
    }
  return {
    id: "submit-work",
    label: "Submit work as done",
    disabled: false,
    reason: "All required inspection work is complete.",
  }
}

export function completeTask(
  progress: InspectionTaskProgress,
  fieldwork: Fieldwork,
  followUpRequired: boolean,
  followUpCompleted: boolean,
  completedAt = new Date().toISOString()
): InspectionTaskProgress {
  const action = nextTaskAction(
    progress,
    fieldwork,
    followUpRequired,
    followUpCompleted
  )
  if (action.id !== "submit-work" || action.disabled)
    throw new Error(action.reason)
  return { ...progress, completedAt }
}

function isTaskProgress(
  value: unknown,
  assignmentId: string
): value is InspectionTaskProgress {
  if (!value || typeof value !== "object") return false
  const progress = value as Partial<InspectionTaskProgress>
  return (
    progress.assignmentId === assignmentId &&
    [
      progress.noticeSentAt,
      progress.acknowledgedAt,
      progress.appointmentDate,
      progress.followUpStartedAt,
      progress.completedAt,
    ].every((entry) => entry === undefined || typeof entry === "string")
  )
}

export function taskProgressStorageKey(
  officerId: string,
  assignmentId: string
) {
  return `${STORAGE_PREFIX}${officerId}:${assignmentId}`
}

export function readTaskProgress(
  storage: Pick<Storage, "getItem">,
  officerId: string,
  assignment: Assignment
): InspectionTaskProgress {
  try {
    const raw = storage.getItem(
      taskProgressStorageKey(officerId, assignment.id)
    )
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isTaskProgress(parsed, assignment.id)
      ? parsed
      : createTaskProgress(assignment)
  } catch {
    return createTaskProgress(assignment)
  }
}

export function saveTaskProgress(
  storage: Pick<Storage, "setItem">,
  officerId: string,
  progress: InspectionTaskProgress
) {
  storage.setItem(
    taskProgressStorageKey(officerId, progress.assignmentId),
    JSON.stringify(progress)
  )
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent(TASK_PROGRESS_EVENT, { detail: progress })
    )
}
