import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PremisesInspectionTable } from "@/components/shared/premises-inspection-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { LinkedTableRow } from "@/components/shared/linked-table-row"
import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Building2,
  ShieldAlert,
  ClipboardClock,
  CalendarClock,
} from "lucide-react"
import type { ComplianceStatus, Premises } from "@/domain/types"
import { TelemetryCard } from "@/components/shared/telemetry-card"
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
  healthApproval?: string
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
  basePath = "/moh/businesses",
  showMetrics = false,
  healthApprovalFilter,
  filtersInDialog = false,
}: {
  filtersInDialog?: boolean
  healthApprovalFilter?: { value: string; onChange: (value: string) => void }
  showMetrics?: boolean
  basePath?: string
  businesses: MohBusinessDirectoryEntry[]
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<MohBusinessStatus | "all">("all")
  const [ward, setWard] = useState("all")
  const [premisesType, setPremisesType] = useState("all")
  const [sort, setSort] = useState<MohBusinessSort>("business-asc")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draft, setDraft] = useState({
    approval: "all",
    ward: "all",
    premisesType: "all",
    status: "all" as MohBusinessStatus | "all",
    sort: "business-asc" as MohBusinessSort,
  })
  const activeFilterCount = [
    healthApprovalFilter && healthApprovalFilter.value !== "all",
    ward !== "all",
    premisesType !== "all",
    status !== "all",
    sort !== "business-asc",
  ].filter(Boolean).length
  function openFilters(open: boolean) {
    if (open)
      setDraft({
        approval: healthApprovalFilter?.value ?? "all",
        ward,
        premisesType,
        status,
        sort,
      })
    setFiltersOpen(open)
  }
  function applyFilters() {
    setWard(draft.ward)
    setPremisesType(draft.premisesType)
    setStatus(draft.status)
    setSort(draft.sort)
    healthApprovalFilter?.onChange(draft.approval)
    setFiltersOpen(false)
  }
  const wards = useMemo(
    () => [...new Set(businesses.map((business) => business.ward))].sort(),
    [businesses]
  )
  const premisesTypes = useMemo(
    () =>
      [...new Set(businesses.map((business) => business.premisesType))].sort(),
    [businesses]
  )
  const approvalOptions = [
    ...new Set([
      "Approved",
      "Awaiting decision",
      "Denied",
      "Not applied",
      "Expiring Soon",
      "Expired",
      "Suspended",
      ...businesses
        .map((business) => business.healthApproval)
        .filter((value): value is string => !!value),
    ]),
  ].sort()
  const visibleBusinesses = useMemo(
    () =>
      filterAndSortMohBusinesses(
        businesses,
        query,
        status,
        ward,
        premisesType,
        sort
      ).filter(
        (business) =>
          !healthApprovalFilter ||
          healthApprovalFilter.value === "all" ||
          business.healthApproval === healthApprovalFilter.value
      ),
    [businesses, premisesType, query, sort, status, ward, healthApprovalFilter]
  )
  const controlsActive =
    (healthApprovalFilter && healthApprovalFilter.value !== "all") ||
    !!query.trim() ||
    status !== "all" ||
    ward !== "all" ||
    premisesType !== "all" ||
    sort !== "business-asc"

  function resetDirectory() {
    healthApprovalFilter?.onChange("all")
    setQuery("")
    setStatus("all")
    setWard("all")
    setPremisesType("all")
    setSort("business-asc")
  }

  function premisesHref(id: string): string {
    return `${basePath}/${encodeURIComponent(id)}?source=search`
  }

  const filterControls = (
    <FieldGroup
      className={
        filtersInDialog
          ? "grid gap-4 sm:grid-cols-2"
          : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      }
    >
      {healthApprovalFilter && (
        <Field className="gap-2">
          <FieldLabel htmlFor="premises-health-approval">
            Health Approval
          </FieldLabel>
          <Select
            items={[
              { value: "all", label: "All approval statuses" },
              ...approvalOptions.map((value) => ({ value, label: value })),
            ]}
            value={
              filtersInDialog ? draft.approval : healthApprovalFilter.value
            }
            onValueChange={(value) =>
              filtersInDialog
                ? setDraft({ ...draft, approval: value ?? "all" })
                : healthApprovalFilter.onChange(value ?? "all")
            }
          >
            <SelectTrigger
              id="premises-health-approval"
              className="min-h-11 w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All approval statuses</SelectItem>
                {approvalOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )}
      <Field className="gap-2">
        <FieldLabel htmlFor="moh-premises-ward">Ward</FieldLabel>
        <Select
          items={[
            { value: "all", label: "All wards" },
            ...wards.map((item) => ({ value: item, label: item })),
          ]}
          value={filtersInDialog ? draft.ward : ward}
          onValueChange={(value) =>
            filtersInDialog
              ? setDraft({ ...draft, ward: value ?? "all" })
              : setWard(value ?? "all")
          }
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
          value={filtersInDialog ? draft.premisesType : premisesType}
          onValueChange={(value) =>
            filtersInDialog
              ? setDraft({ ...draft, premisesType: value ?? "all" })
              : setPremisesType(value ?? "all")
          }
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
          value={filtersInDialog ? draft.status : status}
          onValueChange={(value) =>
            filtersInDialog
              ? setDraft({ ...draft, status: value ?? "all" })
              : setStatus(value ?? "all")
          }
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
          value={filtersInDialog ? draft.sort : sort}
          onValueChange={(value) =>
            filtersInDialog
              ? setDraft({ ...draft, sort: value ?? "business-asc" })
              : setSort(value ?? "business-asc")
          }
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
  )
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Premises"
        description={
          healthApprovalFilter
            ? "Browse registered premises, Health Approval and compliance status."
            : "Browse registered premises, their current certification stage, and overall compliance status."
        }
        divided={false}
      />
      {showMetrics && (
        <section
          aria-label="Premises summary"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <TelemetryCard
            label="Registered"
            value={businesses.length}
            icon={Building2}
          />
          <TelemetryCard
            label="Action required"
            value={
              businesses.filter(
                (business) =>
                  business.status === "Non-compliant" ||
                  business.status === "Suspended"
              ).length
            }
            icon={ShieldAlert}
          />
          <TelemetryCard
            label="Pending"
            value={
              businesses.filter((business) => business.status === "Pending")
                .length
            }
            icon={ClipboardClock}
          />
          <TelemetryCard
            label="Expiring soon"
            value={
              businesses.filter(
                (business) => business.status === "Expiring soon"
              ).length
            }
            icon={CalendarClock}
          />
        </section>
      )}

      <section aria-label="Find premises" className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
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
              placeholder={
                filtersInDialog
                  ? "Search premises"
                  : "Search name, reference, address, ward, type or stage"
              }
            />
          </div>
          {filtersInDialog && (
            <Dialog open={filtersOpen} onOpenChange={openFilters}>
              <DialogTrigger
                render={<Button variant="outline" className="min-h-11" />}
              >
                <SlidersHorizontal
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </DialogTrigger>
              <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                {filterControls}
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() =>
                      setDraft({
                        approval: "all",
                        ward: "all",
                        premisesType: "all",
                        status: "all",
                        sort: "business-asc",
                      })
                    }
                  >
                    Reset
                  </Button>
                  <Button className="min-h-11" onClick={applyFilters}>
                    Apply changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!filtersInDialog && filterControls}
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
              sort === "business-asc" &&
              (!healthApprovalFilter || healthApprovalFilter.value === "all")
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
                    <TableHead>
                      {healthApprovalFilter
                        ? "Health Approval"
                        : "Current stage"}
                    </TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleBusinesses.map((business) => (
                    <LinkedTableRow key={business.id}>
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
                      <TableCell>
                        {healthApprovalFilter ? (
                          <StatusBadge
                            status={business.healthApproval ?? "Not applied"}
                          />
                        ) : (
                          business.stage
                        )}
                      </TableCell>
                      <TableCell className="px-4">
                        <BusinessStatusBadge status={business.status} />
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Button
                          variant="outline"
                          className="min-h-11"
                          nativeButton={false}
                          render={<Link to={premisesHref(business.id)} />}
                        >
                          View
                          <ArrowRight
                            data-icon="inline-end"
                            aria-hidden="true"
                          />
                        </Button>
                      </TableCell>
                    </LinkedTableRow>
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
                    {healthApprovalFilter ? (
                      <p className="flex items-center gap-2">
                        Health Approval{" "}
                        <StatusBadge
                          status={business.healthApproval ?? "Not applied"}
                        />
                      </p>
                    ) : (
                      <p>{business.stage}</p>
                    )}
                    <p className="text-muted-foreground">{business.address}</p>
                    <Button
                      variant="outline"
                      className="mt-2 min-h-11 w-full"
                      nativeButton={false}
                      render={<Link to={premisesHref(business.id)} />}
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

export function MohPremisesOverview({
  premises,
  basePath = "/moh/businesses",
  showDocuments = true,
}: {
  premises: Premises
  basePath?: string
  showDocuments?: boolean
}) {
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
        backHref={`${basePath}/${encodeURIComponent(premises.id)}?source=search`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="link"
        className="min-h-11 self-start px-0"
        nativeButton={false}
        render={<Link to={basePath} />}
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
                {showDocuments && (
                  <TabsTrigger value="documents" className="flex-none px-4">
                    Documents · {documentCount}
                  </TabsTrigger>
                )}
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
                <div className="min-w-0 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    <span>Open findings</span>:{" "}
                    <strong className="font-semibold text-foreground tabular-nums">
                      {premises.outstandingContraventions}
                    </strong>
                  </p>
                  <PremisesInspectionTable
                    entries={premises.inspections.map((inspection) => ({
                      ...inspection,
                      date: inspection.scheduledAt,
                    }))}
                  />
                </div>
              </TabsContent>
              <TabsContent value="certificates">
                <PremisesCertificateCards
                  certificates={premises.certificates}
                  getCertificateHref={(certificate) =>
                    certificate.id
                      ? `${basePath}/${encodeURIComponent(premises.id)}?source=search&certificate=${encodeURIComponent(certificate.id)}`
                      : undefined
                  }
                />
              </TabsContent>
              {showDocuments && (
                <TabsContent value="documents">
                  <PremisesDocumentsPanel
                    businessName={profile.businessName}
                    documents={premises.documents}
                    photos={profile.photos}
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
