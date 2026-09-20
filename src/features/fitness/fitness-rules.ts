import type {
  FitnessApplication,
  FitnessCertificate,
  FitnessFacility,
  FitnessRuleResult,
  FoodHandler,
  HandlerReadiness,
} from "./fitness-types"

export function handlerReadiness(handler: FoodHandler): HandlerReadiness {
  const reasons: string[] = []
  if (handler.archivedAt) reasons.push("Restore this former staff member")
  if (!handler.identityNumber.trim()) reasons.push("Add an identity number")
  if (!handler.role.trim()) reasons.push("Add a job role")
  if (!handler.phone.trim()) reasons.push("Add a phone number")
  if (!handler.consent) reasons.push("Record the handler's consent")

  return { ready: reasons.length === 0, reasons }
}

export function beginApplication(
  handlers: readonly FoodHandler[],
  handlerIds: readonly string[],
  id = "fitness-application-1",
  currentApplication: FitnessApplication | null = null
): FitnessRuleResult<FitnessApplication> {
  if (
    currentApplication &&
    currentApplication.stage !== "draft" &&
    currentApplication.stage !== "review"
  ) {
    return {
      ok: false,
      error: "Selected handlers can only be changed before payment",
    }
  }
  const selectedIds = [...new Set(handlerIds)]
  if (selectedIds.length === 0) {
    return { ok: false, error: "Select at least one eligible food handler" }
  }

  const handlersById = new Map(handlers.map((handler) => [handler.id, handler]))
  const unavailableHandlerId = selectedIds.find((handlerId) => {
    const handler = handlersById.get(handlerId)
    return !handler || !handlerReadiness(handler).ready
  })
  if (unavailableHandlerId) {
    return {
      ok: false,
      error:
        "Every selected food handler must have identity, role, contact, and consent",
    }
  }

  return {
    ok: true,
    value: { id, handlerIds: selectedIds, stage: "draft" },
  }
}

export function chooseFacility(
  application: FitnessApplication,
  facility: Pick<FitnessFacility, "id" | "priceNgn"> | string,
  totalNgn?: number
): FitnessRuleResult<FitnessApplication> {
  if (application.stage !== "draft" && application.stage !== "review") {
    return {
      ok: false,
      error: "The facility can only be changed before payment",
    }
  }

  const facilityId = typeof facility === "string" ? facility : facility.id
  const price = typeof facility === "string" ? totalNgn : facility.priceNgn
  if (!facilityId || !Number.isFinite(price) || (price ?? 0) <= 0) {
    return {
      ok: false,
      error: "Choose an approved facility with a valid price",
    }
  }

  return {
    ok: true,
    value: {
      ...application,
      facilityId,
      totalNgn: price,
      stage: "review",
    },
  }
}

export function confirmDemoPayment(
  application: FitnessApplication,
  handlers: readonly FoodHandler[]
): FitnessRuleResult<FitnessApplication> {
  if (application.stage !== "review" || !application.facilityId) {
    return {
      ok: false,
      error: "Choose an approved facility before payment",
    }
  }
  if (
    !Number.isFinite(application.totalNgn) ||
    (application.totalNgn ?? 0) <= 0
  ) {
    return {
      ok: false,
      error: "A valid assessment total is required for payment",
    }
  }
  const handlersById = new Map(handlers.map((handler) => [handler.id, handler]))
  const hasIneligibleSelection = application.handlerIds.some((handlerId) => {
    const handler = handlersById.get(handlerId)
    return !handler || !handlerReadiness(handler).ready
  })
  if (hasIneligibleSelection) {
    return {
      ok: false,
      error: "Selected handlers must remain eligible before payment",
    }
  }

  return {
    ok: true,
    value: {
      ...application,
      stage: "awaiting-facility",
      paymentReference: `FIT-PAY-${application.id.toUpperCase()}`,
    },
  }
}

export function recordFitResult(
  application: FitnessApplication
): FitnessRuleResult<FitnessApplication> {
  if (application.stage !== "awaiting-facility") {
    return {
      ok: false,
      error: "A facility result is required before this step",
    }
  }

  return { ok: true, value: { ...application, stage: "result-received" } }
}

export function issueDemoCertificate(
  application: FitnessApplication,
  councilId: string,
  dates: Pick<
    FitnessCertificate,
    "issuedAt" | "expiresAt"
  > = defaultCertificateDates()
): FitnessRuleResult<FitnessApplication> {
  if (application.stage !== "result-received") {
    return {
      ok: false,
      error: "A fit facility result is required before issuing a certificate",
    }
  }
  if (!councilId.trim()) {
    return { ok: false, error: "An issuing council is required" }
  }

  return {
    ok: true,
    value: {
      ...application,
      stage: "issued",
      certificate: {
        id: `FIT-CERT-${application.id.toUpperCase()}`,
        handlerIds: [...application.handlerIds],
        councilId,
        issuedAt: dates.issuedAt,
        expiresAt: dates.expiresAt,
      },
    },
  }
}

function defaultCertificateDates(): Pick<
  FitnessCertificate,
  "issuedAt" | "expiresAt"
> {
  const issuedAt = new Date().toISOString()
  const expiry = new Date(issuedAt)
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1)
  return { issuedAt, expiresAt: expiry.toISOString() }
}
