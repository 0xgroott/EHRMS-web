import { beforeEach, describe, expect, it } from "vitest"
import { emptyBusinessState } from "@/data/business-seeds"
import {
  businessQueryKeys,
  businessStateOptions,
} from "./business-query-options"
import { createBusinessRepository } from "./business-repository"
import { createBusinessStorage, STORAGE_KEY } from "./business-storage"

const validAccount = {
  businessName: "Riverside Kitchen",
  contactName: "Ada Okafor",
  phone: "08098765432",
  email: "ada@riverside.ng",
  password: "not-stored-password",
  acceptedTerms: true,
}

describe("business repository", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("falls back to the schema version 1 empty seed for malformed storage", () => {
    localStorage.setItem(STORAGE_KEY, "not-json")

    expect(createBusinessStorage(localStorage).read()).toEqual(
      emptyBusinessState
    )
  })

  it("falls back to the empty seed for an unsupported storage schema", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...emptyBusinessState, schemaVersion: 2 })
    )

    expect(createBusinessStorage(localStorage).read()).toEqual(
      emptyBusinessState
    )
  })

  it("persists setup after a created account verifies the demo code", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )

    expect(repository.createAccount(validAccount).ok).toBe(true)
    expect(repository.verifyContact("123456").ok).toBe(true)

    expect(createBusinessStorage(localStorage).read()).toMatchObject({
      stage: "setup",
      profile: { verified: true },
    })
  })

  it("never serializes an account password or OTP", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )

    repository.createAccount(validAccount)
    repository.verifyContact("123456")

    const serialized = localStorage.getItem(STORAGE_KEY)
    expect(serialized).not.toContain(validAccount.password)
    expect(serialized).not.toContain("123456")
  })

  it("does not advance onboarding when the OTP is invalid", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )

    repository.createAccount(validAccount)
    const result = repository.verifyContact("000000")

    expect(result.ok).toBe(false)
    expect(repository.getState()).toMatchObject({
      stage: "verification",
      profile: { verified: false },
    })
  })

  it("resets to the empty seed state", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)

    repository.reset()

    expect(repository.getState()).toEqual(emptyBusinessState)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("returns validation errors without persisting an invalid account", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )

    const result = repository.createAccount({
      ...validAccount,
      password: "short",
    })

    expect(result).toMatchObject({
      ok: false,
      errors: { password: expect.any(String) },
    })
    expect(repository.getState()).toEqual(emptyBusinessState)
  })

  it("signs in the seeded returning business only with valid credentials", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )

    expect(
      repository.signInDemo("ada@riverside.ng", "incorrect-password")
    ).toMatchObject({ ok: false, errors: { credentials: expect.any(String) } })
    expect(
      repository.signInDemo("ada@riverside.ng", "riverside-demo")
    ).toMatchObject({
      ok: true,
      state: { stage: "complete", profile: { id: "BUS-001" } },
    })
  })

  it("updates contact details while retaining verification stage", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)

    const result = repository.updateContact({
      email: "new-contact@riverside.ng",
      phone: "+234 803 123 4567",
    })

    expect(result).toMatchObject({
      ok: true,
      state: {
        stage: "verification",
        profile: {
          email: "new-contact@riverside.ng",
          phone: "+234 803 123 4567",
        },
      },
    })
  })

  it("saves premises drafts without completing onboarding", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)
    repository.verifyContact("123456")
    const premises = {
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
      councilId: "phc",
    }

    const result = repository.savePremisesDraft(premises, [
      { id: "DOC-1", name: "menu.pdf", size: 100, category: "menu" },
    ])

    expect(result).toMatchObject({
      ok: true,
      state: {
        stage: "setup",
        profile: { premises, documents: [{ id: "DOC-1" }] },
      },
    })
  })

  it("validates premises before completing setup", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)
    repository.verifyContact("123456")

    const failed = repository.completeSetup({
      premisesName: "",
      businessType: "",
      address: "",
      ward: "",
      councilId: "",
    })
    expect(failed).toMatchObject({
      ok: false,
      errors: { premisesName: expect.any(String) },
    })

    const completed = repository.completeSetup({
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
      councilId: "phc",
    })
    expect(completed).toMatchObject({
      ok: true,
      state: { stage: "complete", profile: { verified: true } },
    })
  })
})

describe("business query options", () => {
  it("uses a stable state query key", () => {
    expect(businessQueryKeys.state).toEqual(["business", "state"])
    expect(businessStateOptions().queryKey).toEqual(businessQueryKeys.state)
  })
})
