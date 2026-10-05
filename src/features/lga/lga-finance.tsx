import { LgaCollectionsChart } from "./lga-collections-chart"
import { LinkedTableRow } from "@/components/shared/linked-table-row"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { TelemetryCard } from "@/components/shared/telemetry-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { filterLgaRows, financeTotals } from "./lga-data"
import type { LgaFilters, LgaPayment } from "./lga-data"
import { useLgaData } from "./use-lga-data"
import { LgaFilterBar, money, premisesHref } from "./lga-ui"

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
          <TelemetryCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={
              metric.label !== "Outstanding settlements"
                ? "After refunds"
                : undefined
            }
            className="first:col-span-2 sm:first:col-span-1"
          />
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
  return payments.length ? (
    <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <Table aria-label="Payments">
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Premises</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Collected</TableHead>
            <TableHead>LGA share</TableHead>
            <TableHead>Payouts</TableHead>
            <TableHead>Refunds</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((item) => (
            <LinkedTableRow key={item.id}>
              <TableCell>
                <div>
                  <span className="block font-medium">{item.id}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {item.paidAt}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  to={premisesHref(item.premisesId)}
                  className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                >
                  {item.businessName}
                </Link>
              </TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell>{money(item.amount - item.refunded)}</TableCell>
              <TableCell>{money(item.lgaShare)}</TableCell>
              <TableCell>{money(item.paidOut)}</TableCell>
              <TableCell>{money(item.refunded)}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
            </LinkedTableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ) : (
    <EmptyState
      title="No payments found"
      description="Try another search or choose different filters."
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
      <LgaCollectionsChart payments={payments} />
      <LgaPaymentsTable payments={payments} />
    </div>
  )
}
