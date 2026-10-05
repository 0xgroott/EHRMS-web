import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { filterLgaRows, financeTotals } from "./lga-data"
import type { LgaFilters, LgaPayment } from "./lga-data"
import { useLgaData } from "./use-lga-data"
import { LgaFilterBar, LgaTable, money, premisesHref } from "./lga-ui"

export function LgaFinanceSummary({ payments }: { payments: LgaPayment[] }) {
  const totals = financeTotals(payments)
  const metrics = [
    { label: "Collections", value: money(totals.collections) },
    { label: "LGA share", value: money(totals.lgaShare) },
    {
      label: "Outstanding settlements",
      value: money(totals.pendingSettlement),
    },
  ]
  return (
    <section aria-label="Revenue summary" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card
            size="sm"
            key={metric.label}
            className="first:col-span-2 sm:first:col-span-1"
          >
            <CardHeader>
              <CardTitle>{metric.label}</CardTitle>
              {metric.label !== "Outstanding settlements" && (
                <CardDescription>After refunds</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight tabular-nums lg:text-3xl">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {[
          ["Payouts", money(totals.paidOut)],
          ["Refunds", money(totals.refunds)],
          ["Payments", payments.length],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
export function LgaPaymentsTable({ payments }: { payments: LgaPayment[] }) {
  return (
    <LgaTable
      label="Payments"
      headers={[
        "Reference",
        "Premises",
        "Service",
        "Collected",
        "LGA share",
        "Payouts",
        "Refunds",
        "Status",
      ]}
      emptyTitle="No payments found"
      rows={payments.map((item) => ({
        id: item.id,
        cells: [
          <div>
            <span className="block font-medium">{item.id}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {item.paidAt}
            </span>
          </div>,
          <Link
            to={premisesHref(item.premisesId)}
            className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
          >
            {item.businessName}
          </Link>,
          item.service,
          money(item.amount - item.refunded),
          money(item.lgaShare),
          money(item.paidOut),
          money(item.refunded),
          <StatusBadge status={item.status} />,
        ],
      }))}
    />
  )
}
export function LgaFinancePage() {
  const data = useLgaData()
  const [filters, setFilters] = useState<LgaFilters>({})
  const payments = filterLgaRows(data.payments, filters, (item) => item.paidAt)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Finance" divided={false} />
      <LgaFinanceSummary payments={payments} />
      <LgaFilterBar
        wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
        filters={filters}
        onChange={setFilters}
        dates
        services
      />
      <LgaPaymentsTable payments={payments} />
    </div>
  )
}
