import { describe, expect, it } from "vitest"
import {
  validateAccount,
  validateOtp,
  validatePremises,
} from "./business-validation"

describe("business onboarding validation", () => {
  it("requires consent and a strong password", () => {
    const errors = validateAccount({
      businessName: "Riverside Kitchen",
      contactName: "Ada Okafor",
      phone: "08031234567",
      email: "ada@riverside.ng",
      password: "short",
      acceptedTerms: false,
    })
    expect(errors.password).toBeDefined()
    expect(errors.acceptedTerms).toBeDefined()
  })
  it("accepts only the visible demo OTP", () => {
    expect(validateOtp("123456")).toEqual({})
    expect(validateOtp("654321").code).toBe("Enter the demo code 123456")
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
