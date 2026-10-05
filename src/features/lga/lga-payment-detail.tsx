import { Link, useSearch } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useLgaData } from "./use-lga-data"
import { money, premisesHref } from "./lga-ui"

function Amounts({ rows }: { rows: [string, number][] }) {
  return (
    <dl className="divide-y">
      {rows.map(([label, amount], index) => (
        <div
          key={label}
          className={`flex items-baseline justify-between gap-4 py-3 ${index === rows.length - 1 ? "font-semibold" : ""}`}
        >
          <dt>{label}</dt>
          <dd className="shrink-0 text-right tabular-nums">{money(amount)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function LgaPaymentDetail({ paymentId }: { paymentId: string }) {
  const filters = useSearch({ from: "/lga/_portal/finance_/$paymentId" })
  const data = useLgaData()
  const payment = data.payments.find((item) => item.id === paymentId)
  const back = (
    <Link
      to="/lga/finance"
      search={filters}
      className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to finance
    </Link>
  )
  if (!payment)
    return (
      <div className="flex flex-col gap-6">
        {back}
        <PageHeader
          title="Payment not found"
          description="This payment is unavailable. Return to finance to view your council’s payments."
        />
      </div>
    )
  const pending = payment.lgaShare - payment.paidOut
  const paidDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(payment.paidAt))
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {back}
      <PageHeader
        title="Payment details"
        description={`Payment reference: ${payment.id}`}
        actions={
          <Badge
            variant="outline"
            className={
              payment.status === "Paid"
                ? "border-[var(--border-success)] bg-[var(--background-success)] text-[var(--text-success)]"
                : "border-[var(--border-warning)] bg-[var(--background-warning)] text-[var(--text-warning)]"
            }
          >
            {payment.status}
          </Badge>
        }
      />
      <section aria-label="Payment information" className="flex flex-col gap-4">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Premises", payment.businessName],
            [
              "Service",
              payment.service === "Fitness"
                ? "Fitness test"
                : "Premises fumigation",
            ],
            ["Payment date", paidDate],
            ["Ward", payment.ward],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 space-y-1">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <Link
          to={premisesHref(payment.premisesId)}
          className="inline-flex min-h-11 w-fit items-center text-sm font-medium text-primary hover:underline"
        >
          View premises
        </Link>
      </section>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card role="region" aria-label="Payment breakdown" className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Payment breakdown</h2>
            </CardTitle>
            <CardDescription>
              The amount received and any money returned to the payer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Amounts
              rows={[
                ["Original payment", payment.amount],
                ["Refunded", payment.refunded],
                ["Net collected", payment.amount - payment.refunded],
              ]}
            />
          </CardContent>
        </Card>
        <Card role="region" aria-label="LGA payout" className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>LGA payout</h2>
            </CardTitle>
            <CardDescription>
              The council’s share after refunds, and how much has been paid to
              the council.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Amounts
              rows={[
                ["LGA share", payment.lgaShare],
                ["Paid to LGA", payment.paidOut],
                ["Awaiting payout", pending],
              ]}
            />
            <p className="text-sm text-muted-foreground">
              {pending > 0
                ? "The remaining LGA share is awaiting payout."
                : payment.lgaShare > 0
                  ? "The LGA share has been paid in full."
                  : "No LGA payout is due for this payment."}
            </p>
          </CardContent>
        </Card>
      </div>
      <section aria-labelledby="receipt-heading" className="border-t pt-5">
        <h2 id="receipt-heading" className="text-base font-semibold">
          Payment receipt
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No receipt attached to this payment.
        </p>
      </section>
    </div>
  )
}
