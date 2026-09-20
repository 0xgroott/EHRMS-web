import { beforeEach, describe, expect, it } from "vitest"
import { readBusinessSettings, saveBusinessSettings } from "./business-settings"

beforeEach(() => localStorage.clear())

describe("business settings", () => {
  it("starts with email delivery off and saves preferences per business", () => {
    expect(readBusinessSettings("BUS-001", localStorage)).toEqual({
      applicationEmails: false,
      inspectionEmails: false,
    })
    saveBusinessSettings(
      "BUS-001",
      { applicationEmails: true, inspectionEmails: false },
      localStorage
    )
    expect(readBusinessSettings("BUS-001", localStorage)).toEqual({
      applicationEmails: true,
      inspectionEmails: false,
    })
    expect(
      readBusinessSettings("BUS-002", localStorage).applicationEmails
    ).toBe(false)
  })

  it("ignores malformed saved preferences", () => {
    localStorage.setItem("ehrcms:business-settings:v1:BUS-001", "{}")
    expect(readBusinessSettings("BUS-001", localStorage).inspectionEmails).toBe(
      false
    )
  })
})
