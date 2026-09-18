import type {
  DashboardFilters,
  DemoRole,
  PremisesFilters,
} from "@/domain/types"
import type { createStorage } from "./storage"

type StorageAdapter = ReturnType<typeof createStorage>

export function createRepository(storage: StorageAdapter) {
  return {
    async listPremises(filters: PremisesFilters = {}) {
      const q = filters.q?.trim().toLowerCase()
      return storage
        .read()
        .premises.filter(
          (record) =>
            (!q ||
              [
                record.businessName,
                record.tradingName,
                record.address,
                record.id,
              ].some((value) => value.toLowerCase().includes(q))) &&
            (!filters.councilId || record.councilId === filters.councilId) &&
            (!filters.ward || record.ward === filters.ward) &&
            (!filters.type || record.premisesType === filters.type) &&
            (!filters.status || record.complianceStatus === filters.status)
        )
    },
    async getPremises(id: string) {
      return storage.read().premises.find((record) => record.id === id)
    },
    async listWorkItems(
      role: DemoRole,
      councilId: string,
      filters: DashboardFilters = {}
    ) {
      const q = filters.q?.trim().toLowerCase()
      return storage
        .read()
        .workItems.filter(
          (item) =>
            item.permittedRoles.includes(role) &&
            (!councilId || item.councilId === councilId) &&
            (!q ||
              `${item.title} ${item.description}`.toLowerCase().includes(q)) &&
            (!filters.type || item.kind === filters.type) &&
            (!filters.status || item.status === filters.status)
        )
    },
    async listActivity(councilId?: string) {
      return storage
        .read()
        .activity.filter((event) => !councilId || event.councilId === councilId)
    },
    async listCouncils() {
      return storage.read().councils
    },
  }
}
