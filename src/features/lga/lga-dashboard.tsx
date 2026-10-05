import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { filterLgaRows, financeTotals } from "./lga-data"
import type { LgaFilters } from "./lga-data"
import { useLgaData } from "./use-lga-data"
import { useLga } from "./lga-session"
import { LgaFilterBar, LgaTable, money, premisesHref } from "./lga-ui"

export function LgaDashboard() {
  const { account } = useLga()
  const data = useLgaData()
  const [filters, setFilters] = useState<LgaFilters>({})
  const [tab, setTab] = useState("risks")
  const premises = filterLgaRows(data.premises, filters)
  const approvals = filterLgaRows(data.approvals, filters)
  const inspections = filterLgaRows(data.inspections, filters)
  const totals = financeTotals(filterLgaRows(data.payments, filters))
  const council = seedDatabase.councils.find(
    (item) => item.id === account?.councilId
  )
  const risks = premises.filter((item) => item.complianceStatus !== "Compliant")
  const expiring = premises.filter((item) =>
    item.certificates.some(
      (certificate) =>
        ["Expiring Soon", "Expired"].includes(certificate.status) ||
        (certificate.expiresAt &&
          Date.parse(certificate.expiresAt) < Date.now() + 30 * 86_400_000)
    )
  )
  const metrics = [
    {
      label: "Collections",
      value: money(totals.collections),
      href: "/lga/finance",
    },
    {
      label: "Registered premises",
      value: premises.length,
      href: "/lga/premises",
    },
    {
      label: "Awaiting decision",
      value: data.error
        ? "—"
        : approvals.filter((item) => item.status === "Awaiting decision")
            .length,
      href: "/lga/health-approvals",
    },
    {
      label: "Inspections due",
      value: inspections.filter((item) => item.status !== "Completed").length,
      href: "/lga/inspections",
    },
  ]
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`${council?.name ?? "Your LGA"} Council`}
        divided={false}
      />
      {data.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
      <LgaFilterBar
        wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
        filters={filters}
        onChange={setFilters}
      />
      <section
        aria-label="Council overview"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            to={metric.href}
            className="min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Card size="sm" className="h-full">
              <CardHeader>
                <CardTitle>{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
      <Tabs value={tab} onValueChange={setTab} className="min-w-0 gap-5">
        <div className="w-full overflow-x-auto border-b">
          <TabsList
            variant="line"
            aria-label="Dashboard sections"
            className="h-11! min-w-max! justify-start gap-1 rounded-none p-0"
          >
            {[
              ["risks", "Compliance risks"],
              ["expiry", "Expiring certificates"],
              ["activity", "Recent activity"],
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
        <TabsContent value="risks">
          <LgaTable
            label="Compliance risks"
            headers={["Premises", "Ward", "Open findings", "Status", "Action"]}
            emptyTitle="No compliance risks"
            rows={risks.map((item) => ({
              id: item.id,
              cells: [
                <span className="font-medium">{item.businessName}</span>,
                item.ward,
                item.outstandingContraventions,
                <StatusBadge status={item.complianceStatus} />,
                <Link
                  to={premisesHref(item.id)}
                  className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                >
                  View
                </Link>,
              ],
            }))}
          />
        </TabsContent>
        <TabsContent value="expiry">
          <p className="mb-4 text-sm text-muted-foreground">
            Expired or due within 30 days.
          </p>
          <LgaTable
            label="Expiring certificates"
            headers={["Premises", "Ward", "Action"]}
            emptyTitle="No certificates nearing expiry"
            rows={expiring.map((item) => ({
              id: item.id,
              cells: [
                <span className="font-medium">{item.businessName}</span>,
                item.ward,
                <Link
                  to={premisesHref(item.id)}
                  className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                >
                  View certificates
                </Link>,
              ],
            }))}
          />
        </TabsContent>
        <TabsContent value="activity">
          <p className="mb-4 text-sm text-muted-foreground">Council-wide</p>
          {data.activity.length ? (
            <ol className="divide-y">
              {data.activity.slice(0, 5).map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground sm:text-right">
                    {item.actor}
                    <span className="ml-2 sm:mt-1 sm:ml-0 sm:block">
                      {item.occurredAt.slice(0, 10)}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="No recent activity"
              description="Council updates will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
