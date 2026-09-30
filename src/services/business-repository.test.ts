import { beforeEach, describe, expect, it } from "vitest"
import {
  emptyBusinessState,
  ONBOARDING_BUSINESS_CREDENTIALS,
  returningBusinessState,
} from "@/data/business-seeds"
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
  email: "ada@example.test",
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

  it("falls back to the empty seed for a malformed document entry", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...returningBusinessState,
        profile: { ...returningBusinessState.profile, documents: [null] },
      })
    )

    expect(createBusinessStorage(localStorage).read()).toEqual(
      emptyBusinessState
    )
  })

  it("falls back to the empty seed for a malformed alert entry", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...returningBusinessState, alerts: [null] })
    )

    expect(createBusinessStorage(localStorage).read()).toEqual(
      emptyBusinessState
    )
  })

  it("falls back to the empty seed for malformed nested premises", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...returningBusinessState,
        profile: {
          ...returningBusinessState.profile,
          premises: {
            ...returningBusinessState.profile?.premises,
            councilId: null,
          },
        },
      })
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

  it.each(["ada@riverside.ng", "08031234567"])(
    "signs in the seeded returning business using %s only with a valid password",
    (contact) => {
      const repository = createBusinessRepository(
        createBusinessStorage(localStorage)
      )

      expect(
        repository.signInDemo(contact, "incorrect-password")
      ).toMatchObject({
        ok: false,
        errors: { credentials: expect.any(String) },
      })
      expect(repository.signInDemo(contact, "riverside-demo")).toMatchObject({
        ok: true,
        state: { stage: "complete", profile: { id: "BUS-001" } },
      })
    }
  )

  it("starts a new verified business identity every time the onboarding credentials are used", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )

    const first = repository.signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )
    expect(first).toMatchObject({
      ok: true,
      state: {
        stage: "account",
        profile: {
          businessName: "",
          contactName: "",
          email: ONBOARDING_BUSINESS_CREDENTIALS.email,
          verified: true,
        },
      },
    })
    if (!first.ok) throw new Error("Expected onboarding sign-in to succeed")

    const second = repository.signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )
    expect(second).toMatchObject({ ok: true, state: { stage: "account" } })
    if (!second.ok) throw new Error("Expected onboarding sign-in to succeed")
    expect(second.state.profile?.id).not.toBe(first.state.profile?.id)
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain(
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )
  })

  it("saves a fresh business identity and advances directly to premises setup", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )

    expect(
      repository.saveBusinessIdentity({
        businessName: "  Harbour Foods  ",
        contactName: "  Amaka Nwosu  ",
      })
    ).toMatchObject({
      ok: true,
      state: {
        stage: "setup",
        profile: {
          businessName: "Harbour Foods",
          contactName: "Amaka Nwosu",
          verified: true,
        },
      },
    })
  })

  it("keeps fresh onboarding on the identity step when either name is missing", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )

    expect(
      repository.saveBusinessIdentity({
        businessName: " ",
        contactName: " ",
      })
    ).toMatchObject({
      ok: false,
      errors: {
        businessName: expect.any(String),
        contactName: expect.any(String),
      },
    })
    expect(repository.getState()).toMatchObject({
      stage: "account",
      profile: { businessName: "", contactName: "" },
    })
  })

  it("saves valid profile edits without changing verified details or documents", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.signInDemo("ada@riverside.ng", "riverside-demo")
    const before = repository.getState()
    const result = repository.updateProfileDetails({
      businessName: " Riverside Foods ",
      contactName: " Ada Okafor ",
      premisesName: "Riverside Central Kitchen",
      businessType: "Restaurant",
      registrationNumber: "RC-123",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
    })

    expect(result).toMatchObject({
      ok: true,
      state: {
        profile: {
          businessName: "Riverside Foods",
          premises: {
            premisesName: "Riverside Central Kitchen",
            registrationNumber: "RC-123",
          },
        },
      },
    })
    expect(repository.getState().profile).toMatchObject({
      email: before.profile?.email,
      phone: before.profile?.phone,
      verified: true,
      documents: before.profile?.documents,
      premises: { councilId: before.profile?.premises?.councilId },
    })
    repository.reset()
    repository.signInDemo("ada@riverside.ng", "riverside-demo")
    expect(repository.getState().profile?.businessName).toBe("Riverside Foods")
    expect(repository.getState().profile?.premises?.premisesName).toBe(
      "Riverside Central Kitchen"
    )
  })

  it("updates business identity before KYB without changing the setup stage", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.signInDemo(
      ONBOARDING_BUSINESS_CREDENTIALS.email,
      ONBOARDING_BUSINESS_CREDENTIALS.password
    )
    repository.saveBusinessIdentity({
      businessName: "Harbour Foods",
      contactName: "Amaka Nwosu",
    })

    const result = repository.updateBusinessIdentity({
      businessName: " Harbour Market Foods ",
      contactName: " Amaka Okafor ",
    })

    expect(result).toMatchObject({
      ok: true,
      state: {
        stage: "setup",
        profile: {
          businessName: "Harbour Market Foods",
          contactName: "Amaka Okafor",
        },
      },
    })
  })

  it("rejects invalid profile changes without modifying storage", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.signInDemo("ada@riverside.ng", "riverside-demo")
    const before = repository.getState()
    const result = repository.updateProfileDetails({
      businessName: " ",
      contactName: "Ada Okafor",
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
    })
    expect(result).toMatchObject({
      ok: false,
      errors: { businessName: expect.any(String) },
    })
    expect(repository.getState()).toEqual(before)
  })

  it("updates contact details while retaining verification stage", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)
    repository.verifyContact("123456")

    const result = repository.updateContact({
      email: "new-contact@riverside.ng",
      phone: "+234 809 876 5433",
    })

    expect(result).toMatchObject({
      ok: true,
      state: {
        stage: "verification",
        profile: {
          email: "new-contact@riverside.ng",
          phone: "+234 809 876 5433",
          verified: false,
        },
      },
    })
  })

  it("does not change verified contact on a completed account through onboarding", () => {
    const storage = createBusinessStorage(localStorage)
    storage.write(structuredClone(returningBusinessState))
    const repository = createBusinessRepository(storage)
    const before = repository.getState()

    expect(
      repository.updateContact({
        email: "new-contact@riverside.ng",
        phone: "+234 809 876 5433",
      })
    ).toMatchObject({ ok: false, errors: { state: expect.any(String) } })
    expect(repository.getState()).toEqual(before)
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

  it("rejects premises drafts before contact verification", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)

    const before = repository.getState()
    const result = repository.savePremisesDraft({
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
      councilId: "phc",
    })

    expect(result).toMatchObject({
      ok: false,
      errors: { state: expect.any(String) },
    })
    expect(repository.getState()).toEqual(before)
  })

  it("rejects setup completion before contact verification", () => {
    const repository = createBusinessRepository(
      createBusinessStorage(localStorage)
    )
    repository.createAccount(validAccount)

    const before = repository.getState()
    const result = repository.completeSetup({
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
      councilId: "phc",
    })

    expect(result).toMatchObject({
      ok: false,
      errors: { state: expect.any(String) },
    })
    expect(repository.getState()).toEqual(before)
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
