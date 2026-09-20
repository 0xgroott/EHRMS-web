import { describe, expect, it } from "vitest"
import {
  readPaperCertificates,
  recordPaperCertificate,
  validatePaperCertificate,
} from "./eho-paper-certificate"

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

const entry = {
  type: "Fitness" as const,
  reference: "FIT-908",
  seenAt: "2026-09-19",
  expiresAt: "2026-12-31",
  note: "Original shown by site manager",
}

describe("paper certificate observations", () => {
  it("requires a reference and a valid visit date, including when offline", () => {
    expect(
      validatePaperCertificate({ ...entry, reference: " " }, "2026-09-19")
    ).toBe("Enter the reference printed on the certificate.")
    expect(
      validatePaperCertificate({ ...entry, seenAt: "2026-09-20" }, "2026-09-19")
    ).toBe("Date seen cannot be in the future.")
    expect(validatePaperCertificate(entry, "2026-09-19")).toBeNull()
  })

  it("saves a field observation for the officer and premises without changing digital records", () => {
    const storage = memoryStorage()
    const saved = recordPaperCertificate(storage, "EHO-001", "PR-004", entry)
    expect(readPaperCertificates(storage, "EHO-001", "PR-004")).toEqual([saved])
    expect(saved.reference).toBe("FIT-908")
    expect(readPaperCertificates(storage, "EHO-001", "PR-001")).toEqual([])
    expect(readPaperCertificates(storage, "EHO-002", "PR-004")).toEqual([])
    expect(
      storage.getItem("ehrcms:eho:paper-certificates:v1:EHO-001:PR-004")
    ).not.toContain("data:")
  })

  it("ignores corrupt saved observations", () => {
    const storage = memoryStorage()
    storage.setItem("ehrcms:eho:paper-certificates:v1:EHO-001:PR-004", "{bad")
    expect(readPaperCertificates(storage, "EHO-001", "PR-004")).toEqual([])
  })
})
