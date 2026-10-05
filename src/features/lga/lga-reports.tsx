import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { filterLgaRows, createLgaCsv } from "./lga-data"
import type { LgaFilters } from "./lga-data"
import { useLgaData } from "./use-lga-data"
import { useLga } from "./lga-session"
import { LgaExport, LgaFilterBar, LgaTable, daysSince } from "./lga-ui"
import { LgaFinanceSummary, LgaPaymentsTable } from "./lga-finance"

export function LgaReportsPage() {
  const data = useLgaData()
  const { account } = useLga()
  const [report, setReport] = useState("revenue")
  const [filters, setFilters] = useState<LgaFilters>({})
  const wards = [...new Set(data.premises.map((item) => item.ward))].sort()
  const premises = filterLgaRows(data.premises, { ward: filters.ward })
  const payments = filterLgaRows(data.payments, filters, (item) => item.paidAt)
  const approvals = filterLgaRows(data.approvals, filters, (item) => item.date)
  const inspections = filterLgaRows(
    data.inspections,
    filters,
    (item) => item.scheduledAt
  )
  const performance = wards
    .filter((ward) => !filters.ward || ward === filters.ward)
    .map((ward) => {
      const wardApprovals = approvals.filter((item) => item.ward === ward)
      const decided = wardApprovals.filter((item) => item.decidedAt)
      const pending = wardApprovals.filter(
        (item) => item.status === "Awaiting decision"
      )
      const visits = inspections.filter((item) => item.ward === ward)
      const completed = visits.filter(
        (item) => item.status === "Completed"
      ).length
      return {
        ward,
        pending: pending.length,
        oldest: pending.length
          ? Math.max(...pending.map((item) => daysSince(item.date)))
          : 0,
        average: decided.length
          ? Math.round(
              decided.reduce(
                (total, item) => total + daysSince(item.date, item.decidedAt),
                0
              ) / decided.length
            )
          : null,
        completed,
        total: visits.length,
        overdue: visits.filter(
          (item) =>
            item.status !== "Completed" &&
            item.scheduledAt < new Date().toISOString().slice(0, 10)
        ).length,
      }
    })
  const revenueHeaders = [
    "Reference",
    "Date",
    "Premises",
    "Ward",
    "Service",
    "Gross amount (NGN)",
    "Refunds (NGN)",
    "Collections (NGN)",
    "LGA share (NGN)",
    "Payouts (NGN)",
    "Outstanding settlements (NGN)",
  ]
  const complianceHeaders = [
    "Premises",
    "Ward",
    "Business type",
    "Status",
    "Open findings",
    "Certificates nearing expiry or expired",
  ]
  const performanceHeaders = [
    "Ward",
    "Awaiting decision",
    "Oldest waiting (days)",
    "Average decision time (days)",
    "Completed inspections",
    "Total inspections",
    "Completion rate",
    "Overdue inspections",
  ]
  const expiringCount = (
    certificates: (typeof premises)[number]["certificates"]
  ) =>
    certificates.filter(
      (item) =>
        ["Expiring Soon", "Expired"].includes(item.status) ||
        (item.expiresAt &&
          Date.parse(item.expiresAt) < Date.now() + 30 * 86_400_000)
    ).length
  const csv =
    report === "revenue"
      ? createLgaCsv(
          revenueHeaders,
          payments.map((item) => [
            item.id,
            item.paidAt,
            item.businessName,
            item.ward,
            item.service,
            item.amount,
            item.refunded,
            item.amount - item.refunded,
            item.lgaShare,
            item.paidOut,
            item.lgaShare - item.paidOut,
          ])
        )
      : report === "compliance"
        ? createLgaCsv(
            complianceHeaders,
            premises.map((item) => [
              item.businessName,
              item.ward,
              item.premisesType,
              item.complianceStatus,
              item.outstandingContraventions,
              expiringCount(item.certificates),
            ])
          )
        : createLgaCsv(
            performanceHeaders,
            performance.map((item) => [
              item.ward,
              item.pending,
              item.oldest,
              item.average,
              item.completed,
              item.total,
              item.total
                ? `${Math.round((item.completed / item.total) * 100)}%`
                : "No inspections",
              item.overdue,
            ])
          )
  const count =
    report === "revenue"
      ? payments.length
      : report === "compliance"
        ? premises.length
        : performance.length
  const invalidDates = Boolean(
    filters.from && filters.to && filters.from > filters.to
  )
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports"
        divided={false}
        actions={
          <LgaExport
            csv={csv}
            filename={`${account?.councilId ?? "council"}-${report}.csv`}
            disabled={
              !count ||
              invalidDates ||
              (report === "performance" && Boolean(data.error))
            }
          />
        }
      />
      {data.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
      <Tabs
        value={report}
        onValueChange={(value) => {
          setReport(value)
          setFilters({ ward: filters.ward })
        }}
        className="min-w-0 gap-5"
      >
        <div className="w-full overflow-x-auto border-b">
          <TabsList
            variant="line"
            aria-label="Report type"
            className="h-11! min-w-max! justify-start gap-1 rounded-none p-0"
          >
            {[
              ["revenue", "Revenue"],
              ["compliance", "Compliance"],
              ["performance", "Service performance"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="min-h-11 flex-none rounded-none border-b-2 border-b-transparent px-4 transition-none after:hidden data-active:border-b-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <LgaFilterBar
          wards={wards}
          filters={filters}
          onChange={setFilters}
          dates={report !== "compliance"}
          services={report === "revenue"}
        />
        <TabsContent value="revenue" className="space-y-5">
          <LgaFinanceSummary payments={payments} />
          <LgaPaymentsTable payments={payments} />
        </TabsContent>
        <TabsContent value="compliance" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current status · Certificates expired or due within 30 days.
          </p>
          <LgaTable
            label="Compliance"
            headers={complianceHeaders}
            emptyTitle="No premises found"
            rows={premises.map((item) => ({
              id: item.id,
              cells: [
                item.businessName,
                item.ward,
                item.premisesType,
                <StatusBadge status={item.complianceStatus} />,
                item.outstandingContraventions,
                expiringCount(item.certificates),
              ],
            }))}
          />
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <LgaTable
            label="Service performance"
            headers={performanceHeaders}
            emptyTitle="No report data found"
            rows={performance.map((item) => ({
              id: item.ward,
              cells: [
                item.ward,
                data.error ? "Unavailable" : item.pending,
                data.error ? "Unavailable" : item.oldest,
                data.error
                  ? "Unavailable"
                  : (item.average ?? "No decisions recorded"),
                item.completed,
                item.total,
                item.total
                  ? `${Math.round((item.completed / item.total) * 100)}%`
                  : "No inspections",
                item.overdue,
              ],
            }))}
          />
          <p className="text-sm text-muted-foreground">
            Decision time starts at inspection completion. Dates filter
            completed approval inspections and scheduled visits. Overdue visits
            are past their scheduled date.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
