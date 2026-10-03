import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Search } from "lucide-react"
import type { ComplianceStatus, Premises } from "@/domain/types"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PremisesAvatar } from "@/components/shared/premises-avatar"
import { PremisesBusinessInfoPanel } from "@/components/shared/premises-business-info-panel"
import { PremisesCertificateCards } from "@/components/shared/premises-certificate-cards"
import { PremisesCertificateDetail } from "@/components/shared/premises-certificate-detail"
import { PremisesDocumentsPanel } from "@/components/shared/premises-documents-panel"
import { PremisesOverviewCard } from "@/components/shared/premises-overview-card"
import { resolvePremisesProfile } from "@/components/shared/premises-profile-data"
import { VerifiedBusinessName } from "@/components/shared/verified-business-name"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type MohBusinessStatus = ComplianceStatus

export type MohBusinessSort = "business-asc" | "ward" | "stage" | "status"

export interface MohBusinessDirectoryEntry {
  id: string
  businessName: string
  address: string
  premisesType: string
  ward: string
  stage: string
  status: MohBusinessStatus
  kybVerified: boolean
}

const statusOptions: Array<{
  value: MohBusinessStatus | "all"
  label: string
}> = [
  { value: "all", label: "All statuses" },
  { value: "Compliant", label: "Compliant" },
  { value: "Pending", label: "Pending" },
  { value: "Non-compliant", label: "Non-compliant" },
  { value: "Expiring soon", label: "Expiring soon" },
  { value: "Suspended", label: "Suspended" },
]

const sortOptions: Array<{ value: MohBusinessSort; label: string }> = [
  { value: "business-asc", label: "Business A–Z" },
  { value: "ward", label: "Ward" },
  { value: "stage", label: "Current stage" },
  { value: "status", label: "Status" },
]

function businessJourney(
  premises: Premises
): Pick<MohBusinessDirectoryEntry, "stage" | "status"> {
  if (premises.complianceStatus === "Suspended") {
    return { stage: "Health Approval suspended", status: "Suspended" }
  }

  if (
    premises.complianceStatus === "Compliant" ||
    premises.complianceStatus === "Expiring soon"
  ) {
    return {
      stage: "Health Approval issued",
      status: premises.complianceStatus,
    }
  }

  if (premises.complianceStatus === "Non-compliant") {
    return {
      stage: "Corrective action required",
      status: "Non-compliant",
    }
  }

  return {
    stage:
      premises.id === "PR-018"
        ? "Fumigation certification"
        : "Fitness certification",
    status: "Pending",
  }
}

export function buildMohBusinessDirectory(
  premises: Premises[],
  councilId: string
): MohBusinessDirectoryEntry[] {
  return premises
    .filter((item) => item.councilId === councilId)
    .map((item) => ({
      id: item.id,
      businessName: item.businessName,
      address: item.address,
      premisesType: item.premisesType,
      ward: item.ward,
      kybVerified: item.kybVerified,
      ...businessJourney(item),
    }))
    .sort((left, right) => left.businessName.localeCompare(right.businessName))
}

export function filterAndSortMohBusinesses(
  businesses: MohBusinessDirectoryEntry[],
  query: string,
  status: MohBusinessStatus | "all",
  ward: string,
  premisesType: string,
  sort: MohBusinessSort
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filtered = businesses.filter((business) => {
    const matchesQuery = normalizedQuery
      ? [
          business.businessName,
          business.id,
          business.address,
          business.premisesType,
          business.ward,
          business.stage,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      : true
    return (
      matchesQuery &&
      (status === "all" || business.status === status) &&
      (ward === "all" || business.ward === ward) &&
      (premisesType === "all" || business.premisesType === premisesType)
    )
  })

  return [...filtered].sort((left, right) => {
    if (sort === "ward") return left.ward.localeCompare(right.ward)
    if (sort === "stage") return left.stage.localeCompare(right.stage)
    if (sort === "status") return left.status.localeCompare(right.status)
    return left.businessName.localeCompare(right.businessName)
  })
}

function BusinessStatusBadge({ status }: { status: MohBusinessStatus }) {
  const variant =
    status === "Compliant"
      ? "success"
      : status === "Pending"
        ? "secondary"
        : status === "Expiring soon"
          ? "warning"
          : "destructive"
  return <Badge variant={variant}>{status}</Badge>
}

export function MohBusinessesDirectory({
  businesses,
}: {
  businesses: MohBusinessDirectoryEntry[]
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<MohBusinessStatus | "all">("all")
  const [ward, setWard] = useState("all")
  const [premisesType, setPremisesType] = useState("all")
  const [sort, setSort] = useState<MohBusinessSort>("business-asc")
  const wards = useMemo(
    () => [...new Set(businesses.map((business) => business.ward))].sort(),
    [businesses]
  )
  const premisesTypes = useMemo(
    () =>
      [...new Set(businesses.map((business) => business.premisesType))].sort(),
    [businesses]
  )
  const visibleBusinesses = useMemo(
    () =>
      filterAndSortMohBusinesses(
        businesses,
        query,
        status,
        ward,
        premisesType,
        sort
      ),
    [businesses, premisesType, query, sort, status, ward]
  )
  const controlsActive =
    !!query.trim() ||
    status !== "all" ||
    ward !== "all" ||
    premisesType !== "all" ||
    sort !== "business-asc"

  function resetDirectory() {
    setQuery("")
    setStatus("all")
    setWard("all")
    setPremisesType("all")
    setSort("business-asc")
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Premises"
        description="Browse registered premises, their current certification stage, and overall compliance status."
        divided={false}
      />

      <section aria-label="Find premises" className="flex flex-col gap-6">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="moh-premises-search" className="sr-only">
            Search premises
          </label>
          <Input
            id="moh-premises-search"
            type="search"
            className="min-h-11 pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, reference, address, ward, type or stage"
          />
        </div>

        <FieldGroup className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="moh-premises-ward">Ward</FieldLabel>
            <Select
              items={[
                { value: "all", label: "All wards" },
                ...wards.map((item) => ({ value: item, label: item })),
              ]}
              value={ward}
              onValueChange={(value) => setWard(value ?? "all")}
            >
              <SelectTrigger
                id="moh-premises-ward"
                aria-label="Filter by ward"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All wards</SelectItem>
                  {wards.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="moh-premises-type">Business type</FieldLabel>
            <Select
              items={[
                { value: "all", label: "All business types" },
                ...premisesTypes.map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
              value={premisesType}
              onValueChange={(value) => setPremisesType(value ?? "all")}
            >
              <SelectTrigger
                id="moh-premises-type"
                aria-label="Filter by business type"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All business types</SelectItem>
                  {premisesTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="moh-premises-status">Status</FieldLabel>
            <Select
              items={statusOptions}
              value={status}
              onValueChange={(value) => setStatus(value ?? "all")}
            >
              <SelectTrigger
                id="moh-premises-status"
                aria-label="Filter by status"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="moh-premises-sort">Sort by</FieldLabel>
            <Select
              items={sortOptions}
              value={sort}
              onValueChange={(value) => setSort(value ?? "business-asc")}
            >
              <SelectTrigger
                id="moh-premises-sort"
                aria-label="Sort premises"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      <section aria-label="Premises directory" className="flex flex-col gap-2">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {visibleBusinesses.length} premises
          </p>
          {controlsActive && (
            <Button
              variant="ghost"
              className="min-h-11"
              onClick={resetDirectory}
            >
              {query.trim() &&
              status === "all" &&
              ward === "all" &&
              premisesType === "all" &&
              sort === "business-asc"
                ? "Clear search"
                : "Clear filters"}
            </Button>
          )}
        </div>

        {visibleBusinesses.length ? (
          <>
            <div className="hidden overflow-hidden rounded-xl border bg-card shadow-xs md:block">
              <Table aria-label="Registered premises">
                <TableCaption className="sr-only">
                  Registered premises and their compliance journey
                </TableCaption>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4">Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Current stage</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="px-4 py-3 whitespace-normal">
                        <div className="flex items-center gap-3">
                          <PremisesAvatar name={business.businessName} />
                          <div className="min-w-0">
                            <p className="font-semibold">
                              <VerifiedBusinessName
                                name={business.businessName}
                                verified={business.kybVerified}
                              />
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {business.address}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{business.premisesType}</TableCell>
                      <TableCell>{business.ward}</TableCell>
                      <TableCell>{business.stage}</TableCell>
                      <TableCell className="px-4">
                        <BusinessStatusBadge status={business.status} />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Button
                          variant="outline"
                          className="min-h-11"
                          nativeButton={false}
                          render={
                            <a
                              href={`/moh/businesses/${encodeURIComponent(business.id)}?source=search`}
                            />
                          }
                        >
                          View
                          <ArrowRight
                            data-icon="inline-end"
                            aria-hidden="true"
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 md:hidden">
              {visibleBusinesses.map((business) => (
                <Card key={business.id} size="sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <PremisesAvatar name={business.businessName} />
                      <div className="min-w-0">
                        <CardTitle>
                          <VerifiedBusinessName
                            name={business.businessName}
                            verified={business.kybVerified}
                          />
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {business.premisesType} · {business.ward}
                        </p>
                      </div>
                    </div>
                    <CardAction>
                      <BusinessStatusBadge status={business.status} />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm">
                    <p>{business.stage}</p>
                    <p className="text-muted-foreground">{business.address}</p>
                    <Button
                      variant="outline"
                      className="mt-2 min-h-11 w-full"
                      nativeButton={false}
                      render={
                        <a
                          href={`/moh/businesses/${encodeURIComponent(business.id)}?source=search`}
                        />
                      }
                    >
                      View
                      <ArrowRight data-icon="inline-end" aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No premises found"
            description="Try another search or choose different filters."
          />
        )}
      </section>
    </div>
  )
}

export function MohPremisesOverview({ premises }: { premises: Premises }) {
  const [activeTab, setActiveTab] = useState("business-info")
  const profile = resolvePremisesProfile(premises)
  const documentCount = premises.documents.length + profile.photos.length
  const certificateId =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("certificate")
  const selectedCertificate = premises.certificates.find(
    (certificate) => certificate.id === certificateId
  )

  if (selectedCertificate) {
    return (
      <PremisesCertificateDetail
        premises={premises}
        certificate={selectedCertificate}
        backHref={`/moh/businesses/${encodeURIComponent(premises.id)}?source=search`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="link"
        className="min-h-11 self-start px-0"
        nativeButton={false}
        render={<a href="/moh/businesses" />}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        Back to premises
      </Button>
      <div
        data-slot="premises-workspace"
        className="grid min-w-0 gap-10 lg:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] lg:items-start"
      >
        <PremisesOverviewCard premises={premises} />
        <div className="min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="min-w-0 gap-4"
          >
            <div
              data-slot="premises-tabs"
              className="w-full overflow-x-auto pb-1"
            >
              <TabsList className="h-11! min-w-max justify-start">
                <TabsTrigger value="business-info" className="flex-none px-4">
                  Business info
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-none px-4">
                  Inspection history · {premises.inspections.length}
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex-none px-4">
                  Certificates · {premises.certificates.length}
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-none px-4">
                  Documents · {documentCount}
                </TabsTrigger>
              </TabsList>
            </div>
            <div
              data-slot="premises-tab-panel"
              className="min-h-80 min-w-0 rounded-xl border bg-card p-4 sm:p-6 lg:min-h-[31.5rem] lg:p-8"
            >
              <TabsContent value="business-info">
                <PremisesBusinessInfoPanel premises={premises} />
              </TabsContent>
              <TabsContent value="history">
                <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
                  {premises.inspections.length ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Inspection history</CardTitle>
                        <CardDescription>
                          Completed and scheduled visits for this premises.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {premises.inspections.map((inspection) => (
                          <div
                            key={inspection.id}
                            className="flex flex-wrap items-start justify-between gap-3 py-3"
                          >
                            <div>
                              <p className="font-medium">{inspection.type}</p>
                              <p className="text-xs text-muted-foreground">
                                {inspection.id} · {inspection.scheduledAt} ·{" "}
                                {inspection.officer}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {inspection.status}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ) : (
                    <EmptyState
                      title="No inspection history"
                      description="Completed and scheduled inspections will appear here."
                    />
                  )}
                  <Card size="sm" className="h-fit">
                    <CardHeader>
                      <CardTitle>Open findings</CardTitle>
                      <CardDescription>
                        Findings awaiting corrective action.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <strong className="text-3xl font-semibold tabular-nums">
                        {premises.outstandingContraventions}
                      </strong>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="certificates">
                <PremisesCertificateCards
                  certificates={premises.certificates}
                  getCertificateHref={(certificate) =>
                    certificate.id
                      ? `/moh/businesses/${encodeURIComponent(premises.id)}?source=search&certificate=${encodeURIComponent(certificate.id)}`
                      : undefined
                  }
                />
              </TabsContent>
              <TabsContent value="documents">
                <PremisesDocumentsPanel
                  businessName={profile.businessName}
                  documents={premises.documents}
                  photos={profile.photos}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
