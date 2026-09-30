import { seedDatabase } from "@/data/seeds"
import type { ComplianceStatus, Premises } from "@/domain/types"

export type PremisesSort = "business-name" | "ward" | "business-type" | "status"

export interface PremisesDirectoryOptions {
  ward?: string
  premisesType?: string
  complianceStatus?: ComplianceStatus
  sort?: PremisesSort
}

const collator = new Intl.Collator("en-NG", { sensitivity: "base" })

const sortValue = (premises: Premises, sort: PremisesSort) => {
  if (sort === "ward") return premises.ward
  if (sort === "business-type") return premises.premisesType
  if (sort === "status") return premises.complianceStatus
  return premises.businessName
}

export function searchPremises(
  query: string,
  councilId: string,
  options: PremisesDirectoryOptions = {}
): Premises[] {
  const normalized = query.trim().toLocaleLowerCase()
  const sort = options.sort ?? "business-name"

  return seedDatabase.premises
    .filter(
      (premises) =>
        premises.councilId === councilId &&
        (!normalized ||
          `${premises.businessName} ${premises.tradingName} ${premises.id} ${premises.address} ${premises.ward} ${premises.premisesType}`
            .toLocaleLowerCase()
            .includes(normalized)) &&
        (!options.ward || premises.ward === options.ward) &&
        (!options.premisesType ||
          premises.premisesType === options.premisesType) &&
        (!options.complianceStatus ||
          premises.complianceStatus === options.complianceStatus)
    )
    .sort(
      (left, right) =>
        collator.compare(sortValue(left, sort), sortValue(right, sort)) ||
        collator.compare(left.businessName, right.businessName)
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
