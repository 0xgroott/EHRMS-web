import type { BusinessAlert } from "./business-types"

type CertificateProgress = "not-started" | "in-progress" | "active" | "expired"
type HealthApprovalProgress =
  | "eligible"
  | "notice-served"
  | "notice-acknowledged"
  | "findings-issued"
  | "corrections-recorded"
  | "follow-up-served"
  | "follow-up-acknowledged"
  | "resolved"
  | "approval-issued"
  | "further-action"

export interface BusinessNextActionInput {
  profileComplete: boolean
  alerts: readonly BusinessAlert[]
  foodHandlerCount: number
  fitness: CertificateProgress
  fitnessActionHref?: string
  fumigation: CertificateProgress
  fumigationActionHref?: string
  missingHealthApprovalRequirement: boolean
  healthApprovalStage?: HealthApprovalProgress
}

export interface BusinessNextAction {
  id: string
  title: string
  description: string
  href: string
  label: string
}

// Earliest due date wins; IDs break ties so storage order cannot change the CTA.
export function getUrgentBusinessAlerts(alerts: readonly BusinessAlert[]) {
  const deadline = (value: string) => {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? Infinity : parsed
  }
  return alerts
    .filter((alert) => alert.urgent)
    .sort((a, b) => {
      const difference = deadline(a.dueAt) - deadline(b.dueAt)
      return (
        (Number.isNaN(difference) ? 0 : difference) || a.id.localeCompare(b.id)
      )
    })
}

export function getBusinessNextAction(
  input: BusinessNextActionInput
): BusinessNextAction {
  if (!input.profileComplete)
    return {
      id: "complete-profile",
      title: "Complete your business profile",
      description:
        "Add your premises and council details before starting certificate applications.",
      href: "/business/setup",
      label: "Complete business setup",
    }
  const urgent = getUrgentBusinessAlerts(input.alerts).at(0)
  if (urgent)
    return {
      id: "urgent-alert",
      title: urgent.title,
      description:
        urgent.kind === "inspection"
          ? "Review your inspection notice and the acknowledgement required."
          : "Review the findings and the corrective action required for your premises.",
      href: "/business/inspections",
      label:
        urgent.kind === "inspection"
          ? "Review inspection notice"
          : "Review corrective action",
    }
  if (input.foodHandlerCount === 0)
    return {
      id: "add-food-handlers",
      title: "Add your food handlers",
      description:
        "Register the people who handle food at your premises. Their records are the first step toward a Fitness Certificate.",
      href: "/business/food-handlers",
      label: "Add food handlers",
    }
  if (input.fitness === "not-started" || input.fitness === "expired")
    return {
      id: "start-fitness",
      title:
        input.fitness === "expired"
          ? "Renew your Fitness Certificate"
          : "Start your Fitness application",
      description:
        "Choose eligible food handlers and a facility for their assessment.",
      href:
        input.fitness === "expired"
          ? "/business/fitness/certificate"
          : "/business/fitness/apply",
      label:
        input.fitness === "expired"
          ? "View certificate to renew"
          : "Start Fitness application",
    }
  if (input.fitness === "in-progress")
    return {
      id: "track-fitness",
      title: "Track your Fitness application",
      description:
        "Review the current stage, selected food handlers, and next step for your Fitness application.",
      href: input.fitnessActionHref ?? "/business/fitness/tracker",
      label: "Track Fitness application",
    }
  if (input.fumigation === "not-started" || input.fumigation === "expired")
    return {
      id: "start-fumigation",
      title:
        input.fumigation === "expired"
          ? "Renew your Fumigation Certificate"
          : "Start your Fumigation application",
      description:
        "Choose a provider to arrange fumigation for your registered premises.",
      href:
        input.fumigation === "expired"
          ? "/business/fumigation/certificate"
          : "/business/fumigation/apply",
      label:
        input.fumigation === "expired"
          ? "View certificate to renew"
          : "Start Fumigation application",
    }
  if (input.fumigation === "in-progress")
    return {
      id: "track-fumigation",
      title: "Track your Fumigation application",
      description:
        "Review the provider report, EHO confirmation, and council decision for your premises.",
      href: input.fumigationActionHref ?? "/business/fumigation/tracker",
      label: "Track Fumigation application",
    }
  if (
    input.healthApprovalStage &&
    input.healthApprovalStage !== "approval-issued"
  ) {
    const healthActions: Record<
      Exclude<HealthApprovalProgress, "approval-issued">,
      BusinessNextAction
    > = {
      eligible: {
        id: "health-eligible",
        title: "Health Approval: inspection pending",
        description:
          "Both certificate requirements are complete. Review inspection readiness and the next step.",
        href: "/business/health-approval",
        label: "View Health Approval",
      },
      "notice-served": {
        id: "acknowledge-inspection",
        title: "Acknowledge your inspection notice",
        description:
          "Review the scheduled visit and confirm receipt of the council notice.",
        href: "/business/inspections",
        label: "View inspection notice",
      },
      "notice-acknowledged": {
        id: "await-inspection",
        title: "Inspection scheduled",
        description:
          "Your notice is acknowledged. Review the visit details and preparation instructions.",
        href: "/business/inspections",
        label: "View inspection details",
      },
      "findings-issued": {
        id: "correct-findings",
        title: "Complete corrective actions",
        description:
          "Review each finding and record the work completed before follow-up.",
        href: "/business/inspections",
        label: "View required actions",
      },
      "corrections-recorded": {
        id: "await-follow-up",
        title: "Corrections recorded",
        description:
          "The council follow-up step is next. Review the recorded actions and deadlines.",
        href: "/business/inspections",
        label: "Track follow-up",
      },
      "follow-up-served": {
        id: "acknowledge-follow-up",
        title: "Acknowledge the follow-up notice",
        description:
          "Review the separate follow-up visit and confirm receipt of its notice.",
        href: "/business/inspections",
        label: "View follow-up notice",
      },
      "follow-up-acknowledged": {
        id: "await-follow-up-outcome",
        title: "Follow-up inspection pending",
        description:
          "Your follow-up notice is acknowledged. The council outcome is next.",
        href: "/business/inspections",
        label: "Track follow-up",
      },
      resolved: {
        id: "review-health-decision",
        title: "Review the Health Approval decision",
        description:
          "The corrective actions were resolved after follow-up. Review the council decision.",
        href: "/business/health-approval",
        label: "View Health Approval",
      },
      "further-action": {
        id: "further-action",
        title: "Further action required",
        description:
          "The follow-up left an outstanding finding. Review the recorded outcome and contact the council.",
        href: "/business/inspections",
        label: "Review follow-up outcome",
      },
    }
    return healthActions[input.healthApprovalStage]
  }
  if (input.missingHealthApprovalRequirement)
    return {
      id: "complete-health-requirement",
      title: "Complete your Health Approval requirements",
      description:
        "Review outstanding conditions. Health Approval follows eligibility checks and inspection; there is no direct application.",
      href: "/business/certificates",
      label: "Review missing requirements",
    }
  return {
    id: "monitor-compliance",
    title: "Keep track of your compliance",
    description:
      "Review your certificates and watch for inspection notices and renewal reminders.",
    href: "/business/certificates",
    label: "View certificates",
  }
}
