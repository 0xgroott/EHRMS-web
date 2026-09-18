import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  Building2,
  ClipboardCheck,
  FileClock,
} from "lucide-react"
import { useDemoSession } from "@/app/demo-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { seedDatabase } from "@/data/seeds"
import { dashboardOptions } from "@/services/query-options"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})
function Dashboard() {
  const { role, roleLabel, councilId } = useDemoSession()
  const { data: work = [] } = useQuery(dashboardOptions(role, councilId))
  const council = seedDatabase.councils.find((c) => c.id === councilId)
  const premises = seedDatabase.premises.filter(
    (p) => p.councilId === councilId
  )
  const activity = seedDatabase.activity
    .filter((a) => a.councilId === councilId)
    .slice(0, 5)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operations overview"
        title={`Good afternoon, ${roleLabel}`}
        description={`${council?.name} · Priorities and recent regulatory activity`}
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Registered premises"
          value={premises.length}
          detail="In the selected council"
          icon={Building2}
        />
        <MetricCard
          label="Open work items"
          value={work.length}
          detail="Based on your current role"
          icon={FileClock}
        />
        <MetricCard
          label="Inspections due"
          value={work.filter((w) => w.kind === "inspection").length}
          detail="Assigned and actionable"
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Compliance risks"
          value={
            premises.filter((p) => p.complianceStatus !== "Compliant").length
          }
          detail="At risk, non-compliant or unverified"
          icon={AlertTriangle}
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>My work queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {work.length ? (
                work.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.priority === "high" ? "destructive" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="p-6 text-sm text-muted-foreground">
                  No assigned work for this role and council.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l pl-5">
              {activity.map((event) => (
                <li key={event.id} className="mb-6 last:mb-0">
                  <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-background bg-primary" />
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.description} · {event.actor}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
