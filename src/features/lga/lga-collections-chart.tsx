import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LgaPayment } from "./lga-data"
import { financeTotals } from "./lga-data"
import { money } from "./lga-ui"

export function LgaCollectionsChart({ payments }: { payments: LgaPayment[] }) {
  const services = ["Fitness", "Fumigation"] as const
  const collections = services.map((service) => ({
    service,
    amount: financeTotals(
      payments.filter((payment) => payment.service === service)
    ).collections,
  }))
  const maximum = Math.max(...collections.map((item) => item.amount), 0)
  return (
    <Card role="region" aria-label="Collections by service">
      <CardHeader>
        <CardTitle>
          <h2>Collections by service</h2>
        </CardTitle>
        <CardDescription>
          Collected amounts after refunds, in NGN.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No collections match these filters.
          </p>
        ) : (
          <dl className="grid gap-6">
            {collections.map(({ service, amount }) => (
              <div key={service} className="grid gap-2">
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <dt className="font-medium">{service}</dt>
                  <dd className="font-semibold tabular-nums">
                    {money(amount)}
                  </dd>
                </div>
                <div aria-hidden="true" className="h-7 border-l border-border">
                  <div
                    data-slot="collection-bar"
                    className="h-full rounded-r-sm bg-primary"
                    style={{
                      width: `${maximum > 0 ? (amount / maximum) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
