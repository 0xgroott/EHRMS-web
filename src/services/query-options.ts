import { queryOptions } from "@tanstack/react-query"
import type { DemoRole, PremisesFilters } from "@/domain/types"
import { createRepository } from "./repository"
import { createStorage } from "./storage"

export const queryKeys = {
  dashboard: (role: DemoRole, councilId: string) => ["dashboard", role, councilId] as const,
  premises: (filters: PremisesFilters) => ["premises", filters] as const,
  premisesDetail: (id: string) => ["premises", id] as const,
}

const repository = () => createRepository(createStorage())
export const dashboardOptions = (role: DemoRole, councilId: string) => queryOptions({ queryKey: queryKeys.dashboard(role, councilId), queryFn: () => repository().listWorkItems(role, councilId) })
export const premisesOptions = (filters: PremisesFilters) => queryOptions({ queryKey: queryKeys.premises(filters), queryFn: () => repository().listPremises(filters) })
export const premisesDetailOptions = (id: string) => queryOptions({ queryKey: queryKeys.premisesDetail(id), queryFn: () => repository().getPremises(id) })
