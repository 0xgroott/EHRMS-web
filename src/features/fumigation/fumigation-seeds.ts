import type { LicensedFumigationProvider } from "./fumigation-types"

export const LICENSED_FUMIGATION_PROVIDERS: readonly LicensedFumigationProvider[] =
  [
    {
      id: "clearfield-environmental",
      name: "Clearfield Environmental Services",
      registrationNumber: "PHC/FUM/0184",
      location: "24 Aba Road, Port Harcourt",
      service: "Premises fumigation and service report",
      contact: "0803 555 0173",
      priceNgn: 45000,
    },
    {
      id: "greenline-pest-control",
      name: "Greenline Pest Control",
      registrationNumber: "PHC/FUM/0216",
      location: "9 Stadium Road, Port Harcourt",
      service: "Premises fumigation and service report",
      contact: "0803 555 0184",
      priceNgn: 48000,
    },
    {
      id: "rivershield-hygiene",
      name: "Rivershield Hygiene Services",
      registrationNumber: "PHC/FUM/0248",
      location: "17 Trans Amadi Road, Port Harcourt",
      service: "Premises fumigation and service report",
      contact: "0803 555 0195",
      priceNgn: 52000,
    },
  ]

export function findLicensedProvider(id: string) {
  return LICENSED_FUMIGATION_PROVIDERS.find((provider) => provider.id === id)
}
