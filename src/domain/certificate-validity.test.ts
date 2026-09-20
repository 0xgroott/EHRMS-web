import { expect, it } from "vitest"
import {
  certificateIsValid,
  certificateReminder,
  latestCertificateApplication,
} from "./certificate-validity"

it("keeps the most recently issued certificate available during renewal", () => {
  const older = {
    certificate: { issuedAt: "2025-01-01", expiresAt: "2026-01-01" },
  }
  const newer = {
    certificate: { issuedAt: "2026-01-01", expiresAt: "2027-01-01" },
  }
  expect(latestCertificateApplication(null, [older, newer])).toEqual(newer)
  expect(
    latestCertificateApplication({} as typeof newer, [older, newer])
  ).toEqual(newer)
})

it("shows reminders only near expiry and treats expired coverage as invalid", () => {
  const now = new Date("2026-09-19T12:00:00Z")
  expect(certificateReminder("2026-11-01T00:00:00Z", now)).toBeNull()
  expect(certificateReminder("2026-09-30T00:00:00Z", now)).toContain("11 days")
  expect(certificateReminder("2026-09-18T00:00:00Z", now)).toContain("expired")
  expect(certificateIsValid("2026-09-18T00:00:00Z", now)).toBe(false)
})
