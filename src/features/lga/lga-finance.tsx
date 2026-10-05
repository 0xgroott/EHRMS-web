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
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
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
import { LgaFilterBar, money } from "./lga-ui"

export function LgaFinanceSummary({ payments }: { payments: LgaPayment[] }) {
  const totals = financeTotals(payments)
  const metrics = [
    { label: "Net collections", value: money(totals.collections) },
    { label: "LGA share", value: money(totals.lgaShare) },
    { label: "Awaiting payout", value: money(totals.pendingSettlement) },
  ]
  return (
    <Card
      size="sm"
      role="region"
      aria-label="Revenue summary"
      className="min-w-0"
    >
      <CardHeader>
        <CardTitle>
          <h2>Revenue overview</h2>
        </CardTitle>
        <CardDescription>
          Collections and LGA share are after refunds.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 justify-between gap-5">
        <dl className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {metrics.map(({ label, value }) => (
            <div
              key={label}
              className="flex min-w-0 items-baseline justify-between gap-3 sm:block"
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-xl font-semibold tracking-tight tabular-nums sm:mt-2 xl:text-2xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-3 text-sm">
          {[
            ["Paid to LGA", money(totals.paidOut)],
            ["Refunded", money(totals.refunds)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-2">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

export function LgaPaymentsTable({
  payments,
  filters = {},
}: {
  payments: LgaPayment[]
  filters?: LgaFilters
}) {
  return payments.length ? (
    <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <Table aria-label="Payments">
        <TableHeader>
          <TableRow>
            <TableHead>Payment reference</TableHead>
            <TableHead>Premises</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="text-right">Net collected</TableHead>
            <TableHead className="text-right">LGA share</TableHead>
            <TableHead className="text-right">Paid to LGA</TableHead>
            <TableHead className="text-right">Refunded</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((item) => (
            <LinkedTableRow key={item.id}>
              <TableCell>
                <div>
                  <Link
                    to="/lga/finance/$paymentId"
                    params={{ paymentId: item.id }}
                    search={filters}
                    className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                  >
                    {item.id}
                  </Link>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {item.paidAt}
                  </span>
                </div>
              </TableCell>
              <TableCell>{item.businessName}</TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell className="text-right tabular-nums">
                {money(item.amount - item.refunded)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {money(item.lgaShare)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {money(item.paidOut)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {money(item.refunded)}
              </TableCell>
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
  const filters = useSearch({ from: "/lga/_portal/finance" })
  const navigate = useNavigate({ from: "/lga/finance" })
  const payments = filterLgaRows(data.payments, filters, (item) => item.paidAt)
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Finance" divided={false} />
      <LgaFilterBar
        wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
        filters={filters}
        onChange={(search) => void navigate({ search, replace: true })}
        dates
        services
        showLabels
      />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <LgaFinanceSummary payments={payments} />
        <LgaCollectionsChart payments={payments} />
      </div>
      <section aria-label="Payment records" className="min-w-0 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">Payments</h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {payments.length} {payments.length === 1 ? "payment" : "payments"}
          </p>
        </div>
        <LgaPaymentsTable payments={payments} filters={filters} />
      </section>
    </div>
  )
}
