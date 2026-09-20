import { describe, expect, it } from "vitest"
import { matchMohAccount, verifyMohCode } from "./moh-account"

describe("assigned MOH sign-in", () => {
  it("accepts only the assigned account credentials", () => {
    expect(matchMohAccount("MOH-001", "director-demo")?.id).toBe("MOH-001")
    expect(matchMohAccount("nengi.alabo@phc.gov.ng", "director-demo")?.id).toBe(
      "MOH-001"
    )
    expect(matchMohAccount("MOH-001", "wrong")).toBeNull()
    expect(matchMohAccount("EHO-001", "director-demo")).toBeNull()
  })

  it("requires the complete verification code", () => {
    expect(verifyMohCode("246810")).toBe(true)
    expect(verifyMohCode("24681")).toBe(false)
    expect(verifyMohCode("000000")).toBe(false)
  })
})
