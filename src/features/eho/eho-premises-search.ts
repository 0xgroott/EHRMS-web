import { seedDatabase } from "@/data/seeds"
import type { Premises } from "@/domain/types"

export function searchPremises(query: string, councilId: string): Premises[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return []
  return seedDatabase.premises.filter(
    (premises) =>
      premises.councilId === councilId &&
      `${premises.businessName} ${premises.tradingName} ${premises.id} ${premises.address} ${premises.ward}`
        .toLocaleLowerCase()
        .includes(normalized)
  )
}

export function belongsToOtherCouncil(query: string, councilId: string) {
  const normalized = query.trim().toLocaleLowerCase()
  return (
    !!normalized &&
    seedDatabase.premises.some(
      (premises) =>
        premises.councilId !== councilId &&
        premises.id.toLocaleLowerCase() === normalized
    )
  )
}

export function referenceFromCode(value: string): string | null {
  const trimmed = value.trim()
  const match = trimmed.match(/(?:^|\/)\b(PR-\d{3})\b(?:\/?(?:\?.*)?)?$/i)
  return match?.[1].toUpperCase() ?? null
}

const recentKey = (officerId: string) =>
  `ehrcms:eho:recent-premises:v1:${officerId}`

export function readRecentPremises(
  storage: Pick<Storage, "getItem">,
  officerId: string
): string[] {
  try {
    const parsed: unknown = JSON.parse(
      storage.getItem(recentKey(officerId)) ?? "[]"
    )
    return Array.isArray(parsed)
      ? parsed
          .filter(
            (id): id is string =>
              typeof id === "string" && /^PR-\d{3}$/.test(id)
          )
          .slice(0, 5)
      : []
  } catch {
    return []
  }
}

export function saveRecentPremises(
  storage: Pick<Storage, "getItem" | "setItem">,
  officerId: string,
  premisesId: string
) {
  storage.setItem(
    recentKey(officerId),
    JSON.stringify(
      [
        premisesId,
        ...readRecentPremises(storage, officerId).filter(
          (id) => id !== premisesId
        ),
      ].slice(0, 5)
    )
  )
}
