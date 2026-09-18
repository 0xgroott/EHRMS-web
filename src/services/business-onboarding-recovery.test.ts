import { beforeEach, describe, expect, it } from "vitest"
import { returningBusinessState } from "@/data/business-seeds"
import { createBusinessRepository } from "./business-repository"
import { createBusinessStorage, STORAGE_KEY } from "./business-storage"

const account = {
  businessName: "Recovery Kitchen",
  contactName: "Nora",
  email: "nora@example.test",
  phone: "08098765432",
  password: "not-persisted-password",
  acceptedTerms: true,
}

describe("onboarding recovery", () => {
  beforeEach(() => localStorage.clear())

  it.each([
    ["email", " ADA@RIVERSIDE.NG "],
    ["phone", "0803 123 4567"],
    ["phone", "+234 803 123 4567"],
  ])(
    "rejects reserved %s before registration or contact update writes",
    (field, value) => {
      const repository = createBusinessRepository(createBusinessStorage())
      repository.createAccount(account)
      const before = repository.getState()
      for (const result of [
        repository.createAccount({ ...account, [field]: value }),
        repository.updateContact({
          email: account.email,
          phone: account.phone,
          [field]: value,
        }),
      ]) {
        expect(result).toMatchObject({
          ok: false,
          errors: { [field]: expect.stringContaining("already registered") },
        })
        expect(repository.getState()).toEqual(before)
      }
      expect(
        repository.updateContact({
          email: "changed@example.test",
          phone: "08098765433",
        }).ok
      ).toBe(true)
    }
  )

  it("expires verification independently of the resend countdown, including after reload", () => {
    let now = 1_800_000_000_000
    const repository = createBusinessRepository(
      createBusinessStorage(),
      () => now
    )
    repository.createAccount(account)
    const created = repository.getState()
    expect(created.verificationExpiresAt).toBe(now + 300_000)
    now += 60_000
    expect(repository.verifyContact("123456").ok).toBe(true)
    repository.updateContact({ email: account.email, phone: account.phone })
    now += 300_000
    const reloaded = createBusinessRepository(
      createBusinessStorage(),
      () => now
    )
    expect(reloaded.verifyContact("123456")).toMatchObject({
      ok: false,
      errors: { code: "This code has expired. Request a new code." },
    })
    expect(reloaded.getState().stage).toBe("verification")
    expect(reloaded.resendVerification().ok).toBe(true)
    expect(reloaded.getState().verificationExpiresAt).toBe(now + 300_000)
    expect(reloaded.verifyContact("123456").ok).toBe(true)
  })

  it("keeps legacy registration details but requires a fresh code", () => {
    const legacy = {
      ...returningBusinessState,
      stage: "verification",
      profile: { ...returningBusinessState.profile, verified: false },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const repository = createBusinessRepository(createBusinessStorage())
    expect(repository.getState()).toMatchObject({
      profile: { id: "BUS-001" },
      verificationExpiresAt: 0,
    })
    expect(repository.verifyContact("123456").ok).toBe(false)
    expect(repository.resendVerification().ok).toBe(true)
    expect(repository.verifyContact("123456").ok).toBe(true)
  })

  it.each(["tomorrow", -1, null])(
    "recovers safely from invalid persisted expiry %s",
    (verificationExpiresAt) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...returningBusinessState,
          stage: "verification",
          verificationExpiresAt,
          profile: { ...returningBusinessState.profile, verified: false },
        })
      )
      expect(createBusinessStorage().read().profile).toBeNull()
    }
  )
})
