import type { BusinessAlert } from "./business-types"

type CertificateProgress = "not-started" | "in-progress" | "active" | "expired"

export interface BusinessNextActionInput {
  profileComplete: boolean
  alerts: readonly BusinessAlert[]
  foodHandlerCount: number
  fitness: CertificateProgress
  fitnessActionHref?: string
  fumigation: CertificateProgress
  fumigationActionHref?: string
  missingHealthApprovalRequirement: boolean
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
      href: "/business/fitness/apply",
      label: "Start Fitness application",
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
      href: "/business/fumigation/apply",
      label: "Start Fumigation application",
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
