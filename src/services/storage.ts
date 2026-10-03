import { seedDatabase } from "@/data/seeds"
import type { MockDatabase } from "@/domain/types"

export const STORAGE_KEY = "ehrcms:prototype:v1"

export function createStorage(storage: Storage = window.localStorage) {
  return {
    read(): MockDatabase {
      try {
        const raw = storage.getItem(STORAGE_KEY)
        if (!raw) return structuredClone(seedDatabase)
        const parsed = JSON.parse(raw) as Partial<MockDatabase>
        return parsed.schemaVersion === 4 &&
          Array.isArray(parsed.premises) &&
          Array.isArray(parsed.workItems)
          ? (parsed as MockDatabase)
          : structuredClone(seedDatabase)
      } catch {
        return structuredClone(seedDatabase)
      }
    },
    write(database: MockDatabase) {
      storage.setItem(STORAGE_KEY, JSON.stringify(database))
    },
    reset() {
      storage.removeItem(STORAGE_KEY)
    },
  }
}
