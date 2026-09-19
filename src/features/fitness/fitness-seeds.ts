import type { FitnessFacility } from "./fitness-types"

export const APPROVED_FITNESS_FACILITIES: readonly FitnessFacility[] = [
  {
    id: "phc-health-centre",
    name: "Port Harcourt City Health Centre",
    location: "16 Aggrey Road, Old GRA, Port Harcourt",
    service: "Food-handler fitness assessment",
    contact: "0803 555 0140",
    priceNgn: 12500,
  },
  {
    id: "diobu-community-clinic",
    name: "Diobu Community Clinic",
    location: "31 Ikwerre Road, Diobu, Port Harcourt",
    service: "Food-handler fitness assessment",
    contact: "0803 555 0151",
    priceNgn: 12000,
  },
  {
    id: "riverside-medical-centre",
    name: "Riverside Medical Centre",
    location: "8 Olu Obasanjo Road, Port Harcourt",
    service: "Food-handler fitness assessment",
    contact: "0803 555 0162",
    priceNgn: 13000,
  },
]

export function findApprovedFitnessFacility(id: string) {
  return APPROVED_FITNESS_FACILITIES.find((facility) => facility.id === id)
}
