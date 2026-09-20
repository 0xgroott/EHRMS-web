type WithCertificate = { certificate?: { expiresAt: string; issuedAt: string } }

export function latestCertificateApplication<T extends WithCertificate>(
  application: T | null,
  history: readonly T[] = []
): T | null {
  const issued = [application, ...history].filter((item): item is T =>
    Boolean(item?.certificate)
  )
  return (
    issued.sort(
      (a, b) =>
        Date.parse(b.certificate!.issuedAt) -
        Date.parse(a.certificate!.issuedAt)
    )[0] ?? null
  )
}

export function daysUntilExpiry(expiresAt: string, now = new Date()): number {
  return Math.ceil((Date.parse(expiresAt) - now.getTime()) / 86_400_000)
}

export function certificateReminder(
  expiresAt: string,
  now = new Date(),
  renewalInProgress = false
) {
  const days = daysUntilExpiry(expiresAt, now)
  const nextStep = renewalInProgress
    ? "Renewal in progress."
    : "Start a renewal."
  if (days <= 0) return `Certificate expired. ${nextStep}`
  if (days <= 30)
    return `Certificate expires in ${days} ${days === 1 ? "day" : "days"}. ${nextStep}`
  return null
}

export function certificateIsValid(expiresAt: string, now = new Date()) {
  return Date.parse(expiresAt) > now.getTime()
}
