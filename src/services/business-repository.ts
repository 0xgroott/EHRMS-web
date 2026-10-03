import {
  DEMO_BUSINESS_CREDENTIALS,
  emptyBusinessState,
  ONBOARDING_BUSINESS_CREDENTIALS,
  returningBusinessState,
} from "@/data/business-seeds"
import type {
  BusinessAccountInput,
  BusinessDocument,
  BusinessIdentityInput,
  BusinessPortalState,
  BusinessPremisesInput,
  BusinessProfile,
  BusinessProfileDetailsInput,
  ValidationErrors,
} from "@/domain/business-types"
import {
  validateAccount,
  validateBusinessIdentity,
  validateOtp,
  validatePremises,
  validateProfileDetails,
} from "@/domain/business-validation"
import type { createBusinessStorage } from "./business-storage"

type BusinessStorageAdapter = ReturnType<typeof createBusinessStorage>
export type ContactInput = Pick<BusinessAccountInput, "email" | "phone">
type BusinessRepositoryErrors = Partial<
  Record<
    | keyof BusinessAccountInput
    | keyof BusinessPremisesInput
    | keyof BusinessProfileDetailsInput
    | "code"
    | "credentials"
    | "state",
    string
  >
>

export type BusinessRepositoryResult =
  | { ok: true; state: BusinessPortalState }
  | { ok: false; errors: BusinessRepositoryErrors }

function hasErrors(errors: object) {
  return Object.values(errors).some(Boolean)
}

function nextBusinessId() {
  return `BUS-${globalThis.crypto.randomUUID()}`
}

function failure(errors: BusinessRepositoryErrors): BusinessRepositoryResult {
  return { ok: false, errors }
}

function success(state: BusinessPortalState): BusinessRepositoryResult {
  return { ok: true, state }
}

export const VERIFICATION_LIFETIME_MS = 5 * 60 * 1000

function duplicateContactErrors(
  input: ContactInput
): ValidationErrors<ContactInput> {
  const errors: ValidationErrors<ContactInput> = {}
  if (input.email.trim().toLowerCase() === DEMO_BUSINESS_CREDENTIALS.email) {
    errors.email =
      "This email is already registered. Use another email or sign in."
  }
  const phone = input.phone.replace(/\D/g, "").replace(/^234/, "0")
  if (phone === DEMO_BUSINESS_CREDENTIALS.phone) {
    errors.phone =
      "This phone number is already registered. Use another number or sign in."
  }
  return errors
}

function withProfile(
  state: BusinessPortalState,
  profile: BusinessProfile,
  stage = state.stage
): BusinessPortalState {
  return { ...state, stage, profile }
}

function profileLinksFromDetails(input: BusinessProfileDetailsInput) {
  const links = Object.fromEntries(
    (["website", "instagram", "facebook", "x"] as const)
      .map((name) => [name, input[name]?.trim()] as const)
      .filter((entry): entry is [(typeof entry)[0], string] =>
        Boolean(entry[1])
      )
  )
  return Object.keys(links).length ? links : undefined
}

export function createBusinessRepository(
  storage: BusinessStorageAdapter,
  now: () => number = Date.now
) {
  function write(state: BusinessPortalState): BusinessRepositoryResult {
    storage.write(state)
    return success(state)
  }

  return {
    getState() {
      return storage.read()
    },
    signInDemo(contact: string, password: string): BusinessRepositoryResult {
      if (
        contact === ONBOARDING_BUSINESS_CREDENTIALS.email &&
        password === ONBOARDING_BUSINESS_CREDENTIALS.password
      ) {
        return write({
          ...structuredClone(emptyBusinessState),
          profile: {
            id: nextBusinessId(),
            businessName: "",
            contactName: "",
            phone: "",
            email: ONBOARDING_BUSINESS_CREDENTIALS.email,
            acceptedTerms: true,
            verified: true,
            documents: [],
          },
        })
      }

      if (
        (contact !== DEMO_BUSINESS_CREDENTIALS.email &&
          contact !== DEMO_BUSINESS_CREDENTIALS.phone) ||
        password !== DEMO_BUSINESS_CREDENTIALS.password
      ) {
        return failure({ credentials: "Email or password is incorrect" })
      }

      const seeded = structuredClone(returningBusinessState)
      const details = storage.readSeededProfileDetails()
      if (details && seeded.profile?.premises) {
        seeded.profile.businessName = details.businessName
        seeded.profile.contactName = details.contactName
        seeded.profile.links = profileLinksFromDetails(details)
        Object.assign(seeded.profile.premises, {
          premisesName: details.premisesName,
          businessType: details.businessType,
          registrationNumber: details.registrationNumber,
          address: details.address,
          ward: details.ward,
        })
      }
      return write(seeded)
    },
    saveBusinessIdentity(
      input: BusinessIdentityInput
    ): BusinessRepositoryResult {
      const errors = validateBusinessIdentity(input)
      if (hasErrors(errors)) return failure(errors)

      const state = storage.read()
      if (!state.profile || state.stage !== "account") {
        return failure({ state: "Start a new registration first" })
      }
      if (!state.profile.verified) {
        return failure({ state: "Verify your account before continuing" })
      }

      return write(
        withProfile(
          state,
          {
            ...state.profile,
            businessName: input.businessName.trim(),
            contactName: input.contactName.trim(),
          },
          "setup"
        )
      )
    },
    updateBusinessIdentity(
      input: BusinessIdentityInput
    ): BusinessRepositoryResult {
      const errors = validateBusinessIdentity(input)
      if (hasErrors(errors)) return failure(errors)

      const state = storage.read()
      if (!state.profile?.verified) {
        return failure({ state: "Sign in to edit the business profile" })
      }

      return write(
        withProfile(state, {
          ...state.profile,
          businessName: input.businessName.trim(),
          contactName: input.contactName.trim(),
        })
      )
    },
    createAccount(input: BusinessAccountInput): BusinessRepositoryResult {
      const errors = {
        ...validateAccount(input),
        ...duplicateContactErrors(input),
      }
      if (hasErrors(errors)) return failure(errors)

      const profile: BusinessProfile = {
        id: nextBusinessId(),
        businessName: input.businessName,
        contactName: input.contactName,
        phone: input.phone,
        email: input.email,
        acceptedTerms: input.acceptedTerms,
        verified: false,
        documents: [],
      }

      return write({
        ...withProfile(
          structuredClone(emptyBusinessState),
          profile,
          "verification"
        ),
        verificationExpiresAt: now() + VERIFICATION_LIFETIME_MS,
      })
    },
    verifyContact(code: string): BusinessRepositoryResult {
      const errors = validateOtp(code)
      if (hasErrors(errors)) return failure(errors)

      const state = storage.read()
      if (!state.profile) return failure({ state: "Create an account first" })
      if (state.stage !== "verification")
        return failure({ state: "There is no contact awaiting verification" })
      if (
        !state.verificationExpiresAt ||
        now() >= state.verificationExpiresAt
      ) {
        return failure({ code: "This code has expired. Request a new code." })
      }

      return write(
        withProfile(state, { ...state.profile, verified: true }, "setup")
      )
    },
    resendVerification(): BusinessRepositoryResult {
      const state = storage.read()
      if (!state.profile || state.stage !== "verification") {
        return failure({ state: "There is no contact awaiting verification" })
      }
      return write({
        ...state,
        verificationExpiresAt: now() + VERIFICATION_LIFETIME_MS,
      })
    },
    updateContact(input: ContactInput): BusinessRepositoryResult {
      const state = storage.read()
      if (!state.profile) return failure({ state: "Create an account first" })
      if (state.stage === "complete") {
        return failure({
          state:
            "Contact changes to a completed account require a separate verification process",
        })
      }

      const accountErrors = validateAccount({
        ...state.profile,
        ...input,
        password: "not-persisted-password",
      })
      const errors = {
        email: accountErrors.email,
        phone: accountErrors.phone,
        ...duplicateContactErrors(input),
      }
      if (hasErrors(errors)) return failure(errors)

      return write({
        ...withProfile(
          state,
          {
            ...state.profile,
            email: input.email,
            phone: input.phone,
            verified: false,
          },
          "verification"
        ),
        verificationExpiresAt: now() + VERIFICATION_LIFETIME_MS,
      })
    },
    updateProfileDetails(
      input: BusinessProfileDetailsInput
    ): BusinessRepositoryResult {
      const state = storage.read()
      if (state.stage !== "complete" || !state.profile?.premises) {
        return failure({
          state: "Complete business setup before editing the profile",
        })
      }
      const details = {
        businessName: input.businessName.trim(),
        contactName: input.contactName.trim(),
        premisesName: input.premisesName.trim(),
        businessType: input.businessType.trim(),
        registrationNumber: input.registrationNumber?.trim() || undefined,
        address: input.address.trim(),
        ward: input.ward.trim(),
        website: input.website?.trim() || undefined,
        instagram: input.instagram?.trim() || undefined,
        facebook: input.facebook?.trim() || undefined,
        x: input.x?.trim() || undefined,
      }
      const errors = validateProfileDetails(details)
      if (hasErrors(errors)) return failure(errors)

      const {
        businessName,
        contactName,
        website,
        instagram,
        facebook,
        x,
        ...premisesDetails
      } = details

      const next = withProfile(state, {
        ...state.profile,
        businessName,
        contactName,
        links: profileLinksFromDetails({
          ...details,
          website,
          instagram,
          facebook,
          x,
        }),
        premises: { ...state.profile.premises, ...premisesDetails },
      })
      const result = write(next)
      if (state.profile.id === returningBusinessState.profile?.id) {
        storage.writeSeededProfileDetails(details)
      }
      return result
    },
    savePremisesDraft(
      premises: BusinessPremisesInput,
      documents?: BusinessDocument[]
    ): BusinessRepositoryResult {
      const state = storage.read()
      if (!state.profile) return failure({ state: "Create an account first" })
      if (!state.profile.verified) {
        return failure({ state: "Verify your contact before saving premises" })
      }

      return write(
        withProfile(
          state,
          {
            ...state.profile,
            premises: { ...premises },
            documents: documents
              ? [...documents]
              : [...state.profile.documents],
          },
          "setup"
        )
      )
    },
    completeSetup(
      premises: BusinessPremisesInput,
      documents?: BusinessDocument[]
    ): BusinessRepositoryResult {
      const errors = validatePremises(premises)
      if (hasErrors(errors)) return failure(errors)

      const state = storage.read()
      if (!state.profile) return failure({ state: "Create an account first" })
      if (!state.profile.verified) {
        return failure({ state: "Verify your contact before completing setup" })
      }

      return write(
        withProfile(
          state,
          {
            ...state.profile,
            premises: { ...premises },
            documents: documents
              ? [...documents]
              : [...state.profile.documents],
          },
          "complete"
        )
      )
    },
    reset() {
      storage.reset()
    },
  }
}
