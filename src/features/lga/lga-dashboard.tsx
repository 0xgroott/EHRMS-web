import { LinkedTableRow } from "@/components/shared/linked-table-row"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { TelemetryCard } from "@/components/shared/telemetry-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { filterLgaRows, financeTotals } from "./lga-data"
import type { LgaFilters } from "./lga-data"
import { useLgaData } from "./use-lga-data"
import { useLga } from "./lga-session"
import { LgaFilterBar, money, premisesHref } from "./lga-ui"

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
      href: "/lga/premises?approval=Awaiting%20decision",
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
        actions={
          <LgaFilterBar
            wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
            filters={filters}
            onChange={setFilters}
          />
        }
      />
      {data.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
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
            <TelemetryCard
              label={metric.label}
              value={metric.value}
              className="h-full"
            />
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
          {risks.length ? (
            <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
              <Table aria-label="Compliance risks">
                <TableHeader>
                  <TableRow>
                    <TableHead>Premises</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Open findings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((item) => (
                    <LinkedTableRow key={item.id}>
                      <TableCell>
                        <span className="font-medium">{item.businessName}</span>
                      </TableCell>
                      <TableCell>{item.ward}</TableCell>
                      <TableCell>{item.outstandingContraventions}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.complianceStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={premisesHref(item.id)}
                          className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </LinkedTableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No compliance risks"
              description="Try another search or choose different filters."
            />
          )}
        </TabsContent>
        <TabsContent value="expiry">
          <p className="mb-4 text-sm text-muted-foreground">
            Expired or due within 30 days.
          </p>
          {expiring.length ? (
            <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
              <Table aria-label="Expiring certificates">
                <TableHeader>
                  <TableRow>
                    <TableHead>Premises</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiring.map((item) => (
                    <LinkedTableRow key={item.id}>
                      <TableCell>
                        <span className="font-medium">{item.businessName}</span>
                      </TableCell>
                      <TableCell>{item.ward}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={premisesHref(item.id)}
                          className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                        >
                          View certificates
                        </Link>
                      </TableCell>
                    </LinkedTableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No certificates nearing expiry"
              description="Try another search or choose different filters."
            />
          )}
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
