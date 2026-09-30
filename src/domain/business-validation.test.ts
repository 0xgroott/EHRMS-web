import { describe, expect, it } from "vitest"
import {
  validateAccount,
  validateOtp,
  validatePremises,
} from "./business-validation"

describe("business onboarding validation", () => {
  const validAccount = {
    businessName: "Riverside Kitchen",
    contactName: "Ada Okafor",
    phone: "",
    email: "ada@riverside.ng",
    password: "strong-password",
    acceptedTerms: true,
  }

  const validPremises = {
    premisesName: "Riverside Kitchen",
    businessType: "Restaurant",
    address: "14 Aba Road",
    ward: "Diobu",
    councilId: "ph-city",
  }

  it("accepts valid account and premises details", () => {
    expect(validateAccount(validAccount)).toEqual({})
    expect(validatePremises(validPremises)).toEqual({})
  })

  it("does not require a phone number during account creation", () => {
    expect(validateAccount(validAccount)).toEqual({})
  })

  it("accepts a password at the 10-character boundary", () => {
    expect(
      validateAccount({
        ...validAccount,
        password: "1234567890",
      })
    ).toEqual({})
  })

  it("requires consent and a strong password", () => {
    const errors = validateAccount({
      businessName: "Riverside Kitchen",
      contactName: "Ada Okafor",
      phone: "",
      email: "ada@riverside.ng",
      password: "short",
      acceptedTerms: false,
    })
    expect(errors.password).toBeDefined()
    expect(errors.acceptedTerms).toBeDefined()
  })
  it("accepts only the visible demo OTP", () => {
    expect(validateOtp("123456")).toEqual({})
    expect(validateOtp("654321").code).toBe("Enter code 123456")
  })
  it("requires council and premises address", () => {
    const errors = validatePremises({
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "",
      ward: "Diobu",
      councilId: "",
    })
    expect(errors.address).toBeDefined()
    expect(errors.councilId).toBeDefined()
  })
})
