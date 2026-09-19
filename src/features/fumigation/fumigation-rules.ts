import type {
  FumigationApplication,
  FumigationCertificate,
  FumigationRuleResult,
  LicensedFumigationProvider,
} from "./fumigation-types"

export function beginFumigationApplication(
  requestedPeriod: string,
  declaration: boolean,
  currentApplication: FumigationApplication | null = null,
  id = "fumigation-application-1"
): FumigationRuleResult<FumigationApplication> {
  if (
    currentApplication &&
    currentApplication.stage !== "draft" &&
    currentApplication.stage !== "review"
  ) {
    return {
      ok: false,
      error: "The application can only be changed before payment",
    }
  }
  if (!requestedPeriod.trim()) {
    return { ok: false, error: "Enter the requested fumigation period" }
  }
  if (!declaration) {
    return { ok: false, error: "Confirm the premises declaration" }
  }

  return {
    ok: true,
    value: {
      id: currentApplication?.id ?? id,
      requestedPeriod: requestedPeriod.trim(),
      declaration,
      stage: "draft",
    },
  }
}

export function chooseLicensedProvider(
  application: FumigationApplication,
  provider: LicensedFumigationProvider
): FumigationRuleResult<FumigationApplication> {
  if (application.stage !== "draft" && application.stage !== "review") {
    return {
      ok: false,
      error: "The provider can only be changed before payment",
    }
  }
  if (!application.requestedPeriod.trim() || !application.declaration) {
    return {
      ok: false,
      error: "Complete the period and premises declaration first",
    }
  }
  if (
    !provider.id ||
    !Number.isFinite(provider.priceNgn) ||
    provider.priceNgn <= 0
  ) {
    return { ok: false, error: "Choose a licensed provider with a valid price" }
  }

  return {
    ok: true,
    value: {
      ...application,
      providerId: provider.id,
      totalNgn: provider.priceNgn,
      stage: "review",
    },
  }
}

export function confirmFumigationPayment(
  application: FumigationApplication
): FumigationRuleResult<FumigationApplication> {
  if (
    application.stage !== "review" ||
    !application.providerId ||
    !application.requestedPeriod.trim() ||
    !application.declaration ||
    !Number.isFinite(application.totalNgn) ||
    (application.totalNgn ?? 0) <= 0
  ) {
    return {
      ok: false,
      error: "Complete the application and select a provider before payment",
    }
  }

  return {
    ok: true,
    value: {
      ...application,
      stage: "awaiting-provider",
      paymentReference: `FUM-PAY-${application.id.toUpperCase()}`,
    },
  }
}

export function recordProviderReport(
  application: FumigationApplication,
  workDate = new Date().toISOString().slice(0, 10)
): FumigationRuleResult<FumigationApplication> {
  if (application.stage !== "awaiting-provider") {
    return {
      ok: false,
      error: "Payment confirmation is required before a provider report",
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
    return { ok: false, error: "Enter a valid service date" }
  }
  return {
    ok: true,
    value: { ...application, stage: "report-submitted", workDate },
  }
}

export function confirmEho(
  application: FumigationApplication
): FumigationRuleResult<FumigationApplication> {
  if (application.stage !== "report-submitted" || !application.workDate) {
    return {
      ok: false,
      error: "A provider service report is required before EHO confirmation",
    }
  }
  return { ok: true, value: { ...application, stage: "eho-confirmed" } }
}

export function issueFumigationCertificate(
  application: FumigationApplication,
  councilId: string,
  dates: Pick<
    FumigationCertificate,
    "issuedAt" | "expiresAt"
  > = certificateDates()
): FumigationRuleResult<FumigationApplication> {
  if (application.stage !== "eho-confirmed" || !application.workDate) {
    return {
      ok: false,
      error: "EHO confirmation is required before council issuance",
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
        id: `FUM-CERT-${application.id.toUpperCase()}`,
        councilId,
        issuedAt: dates.issuedAt,
        expiresAt: dates.expiresAt,
        workDate: application.workDate,
      },
    },
  }
}

function certificateDates(): Pick<
  FumigationCertificate,
  "issuedAt" | "expiresAt"
> {
  const issuedAt = new Date().toISOString()
  const expiry = new Date(issuedAt)
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1)
  return { issuedAt, expiresAt: expiry.toISOString() }
}
