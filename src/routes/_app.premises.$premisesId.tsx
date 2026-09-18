import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, FileText, MapPin, ShieldAlert } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const Route = createFileRoute("/_app/premises/$premisesId")({
  component: PremisesDetail,
})
function PremisesDetail() {
  const { premisesId } = Route.useParams()
  const record = seedDatabase.premises.find((p) => p.id === premisesId)
  if (!record)
    return (
      <div className="py-20 text-center">
        <BuildingMissing />
        <h1 className="mt-4 text-xl font-semibold">
          Premises record not found
        </h1>
        <Button variant="link" render={<Link to="/premises" />}>
          Return to premises
        </Button>
      </div>
    )
  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/premises"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to premises
      </Link>
      <PageHeader
        eyebrow={record.id}
        title={record.businessName}
        description={`${record.tradingName} · ${record.premisesType}`}
        actions={<StatusBadge status={record.complianceStatus} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <MapPin className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Registered address
              </p>
              <p className="mt-1 text-sm">
                {record.address}, {record.ward}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldAlert className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Open findings
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {record.outstandingContraventions}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <FileText className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Documents
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {record.documents.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="certificates">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificate standing</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {record.certificates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium">{c.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.id} · Expires {c.expiresAt}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inspections">
          <Card>
            <CardContent className="divide-y p-6">
              {record.inspections.map((i) => (
                <div key={i.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{i.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.scheduledAt} · {i.officer}
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardContent className="divide-y p-6">
              {record.documents.map((d) => (
                <div key={d.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.category}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {d.addedAt}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
function BuildingMissing() {
  return <ShieldAlert className="mx-auto size-8 text-muted-foreground" />
}
