import { describe, expect, it } from "vitest"
import {
  acknowledgeInspectionNotice,
  completeTask,
  createTaskProgress,
  earliestAppointmentDate,
  nextTaskAction,
  resetTaskProgress,
  scheduleAppointment,
  sendInspectionNotice,
} from "./eho-task-progress"
import { assignments } from "./eho-model"
import { createDraft } from "./eho-state"

describe("EHO inspection task progress", () => {
  it("keeps seeded appointments at least seven days after acknowledgement", () => {
    for (const assignment of assignments) {
      const progress = createTaskProgress(assignment)
      const earliest = earliestAppointmentDate(progress)
      if (earliest && progress.appointmentDate)
        expect(progress.appointmentDate >= earliest).toBe(true)
    }
  })

  it("moves an unserved task from notice delivery to business acknowledgement", () => {
    const progress = createTaskProgress(assignments[1])
    const draft = createDraft(assignments[1])

    expect(nextTaskAction(progress, draft, false, false)).toMatchObject({
      id: "send-notice",
      label: "Send notice",
      disabled: false,
    })

    const sent = sendInspectionNotice(progress, "2026-09-29T09:00:00.000Z")
    expect(nextTaskAction(sent, draft, false, false)).toMatchObject({
      id: "await-acknowledgement",
      label: "Awaiting business acknowledgement",
      disabled: true,
    })

    const acknowledged = acknowledgeInspectionNotice(
      sent,
      "2026-09-29T10:00:00.000Z"
    )
    expect(acknowledged.acknowledgedAt).toBe("2026-09-29T10:00:00.000Z")
    expect(nextTaskAction(acknowledged, draft, false, false)).toMatchObject({
      id: "schedule-appointment",
      label: "Schedule appointment",
      disabled: false,
    })
  })

  it("resets one task to the beginning of the notice flow", () => {
    const draft = createDraft(assignments[0])
    const reset = resetTaskProgress(assignments[0].id)

    expect(reset).toEqual({ assignmentId: "EIN-101" })
    expect(nextTaskAction(reset, draft, false, false).id).toBe("send-notice")
  })

  it("requires appointments to be at least seven days after acknowledgement", () => {
    const progress = {
      ...createTaskProgress(assignments[0]),
      appointmentDate: undefined,
      acknowledgedAt: "2026-09-18T10:00:00.000Z",
    }

    expect(earliestAppointmentDate(progress)).toBe("2026-09-25")
    expect(() => scheduleAppointment(progress, "2026-09-24")).toThrow(
      /at least seven days/i
    )
    expect(scheduleAppointment(progress, "2026-09-25").appointmentDate).toBe(
      "2026-09-25"
    )
  })

  it("uses one next action through inspection, follow-up, and task closure", () => {
    const progress = createTaskProgress(assignments[0])
    const draft = createDraft(assignments[0])

    expect(nextTaskAction(progress, draft, false, false).id).toBe(
      "start-inspection"
    )

    const submitted = { ...draft, status: "submitted" as const }
    expect(nextTaskAction(progress, submitted, false, false).id).toBe(
      "submit-work"
    )
    expect(nextTaskAction(progress, submitted, true, false).id).toBe(
      "start-follow-up"
    )
    expect(nextTaskAction(progress, submitted, true, true).id).toBe(
      "submit-work"
    )

    expect(
      nextTaskAction(
        completeTask(progress, submitted, false, false),
        submitted,
        false,
        false
      ).id
    ).toBe("completed")
    expect(() => completeTask(progress, submitted, true, false)).toThrow(
      /follow-up/i
    )
  })
})
