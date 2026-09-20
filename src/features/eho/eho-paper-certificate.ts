import type { CertificateSummary } from "@/domain/types"

type PaperCertificateType = CertificateSummary["type"]

export interface PaperCertificateInput {
  type: PaperCertificateType
  reference: string
  seenAt: string
  expiresAt: string
  note: string
}

export interface PaperCertificateObservation extends PaperCertificateInput {
  id: string
}

const key = (officerId: string, premisesId: string) =>
  `ehrcms:eho:paper-certificates:v1:${officerId}:${premisesId}`

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  )
}

export function validatePaperCertificate(
  input: PaperCertificateInput,
  today: string
): string | null {
  if (!input.reference.trim())
    return "Enter the reference printed on the certificate."
  if (input.reference.trim().length > 80)
    return "Certificate reference must be 80 characters or fewer."
  if (!validDate(input.seenAt)) return "Enter a valid date seen."
  if (input.seenAt > today) return "Date seen cannot be in the future."
  if (input.expiresAt && !validDate(input.expiresAt))
    return "Enter a valid expiry date."
  if (input.note.length > 500) return "Notes must be 500 characters or fewer."
  return null
}

function isObservation(value: unknown): value is PaperCertificateObservation {
  if (!value || typeof value !== "object") return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === "string" &&
    ["Health Approval", "Fumigation", "Fitness"].includes(String(item.type)) &&
    typeof item.reference === "string" &&
    item.reference.length > 0 &&
    item.reference.length <= 80 &&
    typeof item.seenAt === "string" &&
    validDate(item.seenAt) &&
    typeof item.expiresAt === "string" &&
    (!item.expiresAt || validDate(item.expiresAt)) &&
    typeof item.note === "string" &&
    item.note.length <= 500
  )
}

export function readPaperCertificates(
  storage: Pick<Storage, "getItem">,
  officerId: string,
  premisesId: string
): PaperCertificateObservation[] {
  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(key(officerId, premisesId)) ?? "[]"
    )
    return Array.isArray(parsed)
      ? parsed.filter(isObservation).slice(0, 50)
      : []
  } catch {
    return []
  }
}

export function recordPaperCertificate(
  storage: Pick<Storage, "getItem" | "setItem">,
  officerId: string,
  premisesId: string,
  input: PaperCertificateInput
): PaperCertificateObservation {
  const saved: PaperCertificateObservation = {
    ...input,
    reference: input.reference.trim(),
    note: input.note.trim(),
    id: crypto.randomUUID(),
  }
  storage.setItem(
    key(officerId, premisesId),
    JSON.stringify(
      [saved, ...readPaperCertificates(storage, officerId, premisesId)].slice(
        0,
        50
      )
    )
  )
  return saved
}
