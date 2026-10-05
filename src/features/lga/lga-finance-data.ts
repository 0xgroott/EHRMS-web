import { seedDatabase } from "@/data/seeds"

export type LgaPaymentService = "Fitness" | "Fumigation"

export interface LgaPaymentRecord {
  id: string
  premisesId: string
  service: LgaPaymentService
  paidAt: string
  /** All monetary values are integer naira. Amount is the original gross receipt. */
  amount: number
  /** Current council entitlement after the council portion of any refund. */
  lgaShare: number
  /** Net council disbursements; refunded disbursements have already been recovered. */
  paidOut: number
  /** Total customer refund, deducted from amount once to calculate collections. */
  refunded: number
  status: "Paid" | "Partially refunded" | "Refunded"
}

// Fictional ledger linked to existing premises. No settlement or payment writes.
export const lgaPaymentRecords: LgaPaymentRecord[] =
  seedDatabase.premises.flatMap((premises, index) =>
    (["Fitness", "Fumigation"] as const).map((service, serviceIndex) => {
      const amount = [15000, 30000][serviceIndex]
      const refunded = index % 5 === 0 && serviceIndex === 0 ? 5000 : 0
      const lgaShare = (amount - refunded) / 2
      return {
        id: `PAY-${premises.id}-${serviceIndex + 1}`,
        premisesId: premises.id,
        service,
        paidAt: index % 2 ? "2026-10-01" : `2026-09-${20 + serviceIndex}`,
        amount,
        lgaShare,
        paidOut: index % 3 === 0 ? 0 : lgaShare,
        refunded,
        status: refunded ? "Partially refunded" : "Paid",
      }
    })
  )
