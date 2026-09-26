import type { BusinessPortalState } from "@/domain/business-types"

export const emptyBusinessState: BusinessPortalState = {
  schemaVersion: 1,
  stage: "account",
  profile: null,
  alerts: [],
}

export const DEMO_BUSINESS_CREDENTIALS = {
  email: "ada@riverside.ng",
  phone: "08031234567",
  password: "riverside-demo",
} as const

export const ONBOARDING_BUSINESS_CREDENTIALS = {
  email: "start@business.ehrcms.test",
  password: "start-business",
} as const

export const returningBusinessState: BusinessPortalState = {
  schemaVersion: 1,
  stage: "complete",
  profile: {
    id: "BUS-001",
    businessName: "Riverside Kitchen & Foods",
    contactName: "Ada Okafor",
    phone: "08031234567",
    email: "ada@riverside.ng",
    acceptedTerms: true,
    verified: true,
    premises: {
      premisesName: "Riverside Kitchen",
      businessType: "Restaurant",
      address: "12 Abonnema Wharf Road",
      ward: "Diobu",
      councilId: "phc",
    },
    documents: [],
  },
  alerts: [],
}
