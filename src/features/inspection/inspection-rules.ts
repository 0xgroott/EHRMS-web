import { seededInspectionFindings } from "./inspection-seeds"
import type { InspectionCase, InspectionRuleResult } from "./inspection-types"

function failure(error: string): InspectionRuleResult<InspectionCase> {
  return { ok: false, error }
}

function nextDate(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function daysAfter(value: string, days: number): string {
  const date = new Date(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

export function scheduleInspectionNotice(
  current: InspectionCase | null,
  eligible: boolean,
  premises: { councilId: string; premisesName: string },
  scheduledAt = nextDate(7)
): InspectionRuleResult<InspectionCase> {
  if (!eligible)
    return failure("Fitness and Fumigation Certificates must be issued first")
  if (!premises.councilId.trim() || !premises.premisesName.trim()) {
    return failure("A registered premises and council are required")
  }
  if (current) return failure("An inspection case is already open")
  if (Number.isNaN(Date.parse(scheduledAt)))
    return failure("Enter a valid inspection date")
  const id = "inspection-1"
  return {
    ok: true,
    value: {
      id,
      councilId: premises.councilId,
      premisesName: premises.premisesName,
      stage: "notice-served",
      notice: { reference: `INS-NOTICE-${id.toUpperCase()}`, scheduledAt },
      findings: [],
    },
  }
}

export function acknowledgeInspectionNotice(
  inspection: InspectionCase,
  acknowledgedAt = new Date().toISOString()
): InspectionRuleResult<InspectionCase> {
  if (inspection.stage !== "notice-served")
    return failure("The inspection notice cannot be acknowledged at this stage")
  return {
    ok: true,
    value: {
      ...inspection,
      stage: "notice-acknowledged",
      notice: { ...inspection.notice, acknowledgedAt },
    },
  }
}

export function issueInspectionFindings(
  inspection: InspectionCase
): InspectionRuleResult<InspectionCase> {
  if (inspection.stage !== "notice-acknowledged")
    return failure(
      "Acknowledge the served inspection notice before findings are issued"
    )
  return {
    ok: true,
    value: {
      ...inspection,
      stage: "findings-issued",
      findings: seededInspectionFindings(inspection.notice.scheduledAt),
    },
  }
}

export function recordInspectionCorrection(
  inspection: InspectionCase,
  findingId: string,
  note: string
): InspectionRuleResult<InspectionCase> {
  if (
    inspection.stage !== "findings-issued" &&
    inspection.stage !== "corrections-recorded"
  ) {
    return failure("Corrections can only be recorded after findings are issued")
  }
  if (!note.trim()) return failure("Describe the correction made")
  if (!inspection.findings.some((finding) => finding.id === findingId))
    return failure("Select a finding to correct")
  const findings = inspection.findings.map((finding) =>
    finding.id === findingId
      ? { ...finding, correctionNote: note.trim() }
      : finding
  )
  return {
    ok: true,
    value: {
      ...inspection,
      findings,
      stage: findings.every((finding) => finding.correctionNote)
        ? "corrections-recorded"
        : "findings-issued",
    },
  }
}

export function scheduleFollowUpNotice(
  inspection: InspectionCase,
  scheduledAt?: string
): InspectionRuleResult<InspectionCase> {
  if (
    inspection.stage !== "corrections-recorded" ||
    !inspection.findings.length ||
    !inspection.findings.every((finding) => finding.correctionNote?.trim())
  ) {
    return failure(
      "Record a correction for every finding before follow-up is scheduled"
    )
  }
  const latestDeadline = inspection.findings
    .map((finding) => finding.deadline)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0]
  const followUpAt = scheduledAt ?? daysAfter(latestDeadline, 7)
  if (Number.isNaN(Date.parse(followUpAt)))
    return failure("Enter a valid follow-up date")
  return {
    ok: true,
    value: {
      ...inspection,
      stage: "follow-up-served",
      followUpNotice: {
        reference: `INS-FOLLOW-UP-${inspection.id.toUpperCase()}`,
        scheduledAt: followUpAt,
      },
    },
  }
}

export function acknowledgeFollowUpNotice(
  inspection: InspectionCase,
  acknowledgedAt = new Date().toISOString()
): InspectionRuleResult<InspectionCase> {
  if (inspection.stage !== "follow-up-served" || !inspection.followUpNotice)
    return failure("A served follow-up notice is required")
  return {
    ok: true,
    value: {
      ...inspection,
      stage: "follow-up-acknowledged",
      followUpNotice: { ...inspection.followUpNotice, acknowledgedAt },
    },
  }
}

export function resolveInspection(
  inspection: InspectionCase
): InspectionRuleResult<InspectionCase> {
  if (inspection.stage !== "follow-up-acknowledged")
    return failure(
      "The follow-up notice must be acknowledged before resolution"
    )
  return { ok: true, value: { ...inspection, stage: "resolved" } }
}

export function escalateInspection(
  inspection: InspectionCase
): InspectionRuleResult<InspectionCase> {
  if (inspection.stage !== "follow-up-acknowledged")
    return failure(
      "The follow-up notice must be acknowledged before further action"
    )
  return { ok: true, value: { ...inspection, stage: "further-action" } }
}

export function issueHealthApproval(
  inspection: InspectionCase,
  issuedAt?: string
): InspectionRuleResult<InspectionCase> {
  if (inspection.stage !== "resolved")
    return failure(
      "Council resolution is required before Health Approval is issued"
    )
  const followUpTime = Date.parse(inspection.followUpNotice?.scheduledAt ?? "")
  const effectiveIssuedAt =
    issuedAt ??
    new Date(
      Math.max(Date.now(), Number.isNaN(followUpTime) ? 0 : followUpTime)
    ).toISOString()
  const expiry = new Date(effectiveIssuedAt)
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1)
  return {
    ok: true,
    value: {
      ...inspection,
      stage: "approval-issued",
      certificate: {
        id: `HEALTH-APPROVAL-${inspection.id.toUpperCase()}`,
        councilId: inspection.councilId,
        issuedAt: effectiveIssuedAt,
        expiresAt: expiry.toISOString(),
      },
    },
  }
}
