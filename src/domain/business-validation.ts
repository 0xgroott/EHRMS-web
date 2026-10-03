import type {
  BusinessAccountInput,
  BusinessIdentityInput,
  BusinessPremisesInput,
  BusinessProfileDetailsInput,
  ValidationErrors,
} from "./business-types"

export function validateBusinessIdentity(
  value: BusinessIdentityInput
): ValidationErrors<BusinessIdentityInput> {
  const errors: ValidationErrors<BusinessIdentityInput> = {}
  if (!value.businessName.trim())
    errors.businessName = "Enter the registered business name"
  if (!value.contactName.trim()) errors.contactName = "Enter your full name"
  return errors
}

export function validateAccount(
  value: BusinessAccountInput
): ValidationErrors<BusinessAccountInput> {
  const errors: ValidationErrors<BusinessAccountInput> = {}
  if (!value.businessName.trim())
    errors.businessName = "Enter the registered business name"
  if (!value.contactName.trim())
    errors.contactName = "Enter the contact person's name"
  if (!/^\S+@\S+\.\S+$/.test(value.email))
    errors.email = "Enter a valid email address"
  if (value.password.length < 10) errors.password = "Use at least 10 characters"
  if (!value.acceptedTerms)
    errors.acceptedTerms = "Accept the terms and privacy notice"
  return errors
}

export function validateProfileDetails(
  value: BusinessProfileDetailsInput
): ValidationErrors<BusinessProfileDetailsInput> {
  const errors: ValidationErrors<BusinessProfileDetailsInput> = {}
  if (!value.businessName.trim())
    errors.businessName = "Enter the registered business name"
  if (!value.contactName.trim())
    errors.contactName = "Enter the contact person's name"
  if (!value.premisesName.trim())
    errors.premisesName = "Enter the premises name"
  if (!value.businessType.trim())
    errors.businessType = "Enter the business type"
  if (!value.address.trim()) errors.address = "Enter the premises address"
  if (!value.ward.trim()) errors.ward = "Enter the ward"
  for (const field of ["website", "instagram", "facebook", "x"] as const) {
    const link = value[field]?.trim()
    if (!link) continue
    try {
      const url = new URL(link)
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors[field] = "Enter a full http:// or https:// URL"
      }
    } catch {
      errors[field] = "Enter a full http:// or https:// URL"
    }
  }
  return errors
}

export function validateOtp(code: string) {
  return code === "123456" ? {} : { code: "Enter code 123456" }
}

export function validatePremises(
  value: BusinessPremisesInput
): ValidationErrors<BusinessPremisesInput> {
  const errors: ValidationErrors<BusinessPremisesInput> = {}
  if (!value.premisesName.trim())
    errors.premisesName = "Enter the premises name"
  if (!value.businessType) errors.businessType = "Choose a business type"
  if (!value.address.trim()) errors.address = "Enter the premises address"
  if (!value.ward.trim()) errors.ward = "Enter the ward"
  if (!value.councilId) errors.councilId = "Choose a council"
  return errors
}
