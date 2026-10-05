import { healthApprovalStatus } from "./lga-health-approval"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  selectInspections,
  validateInspectionSearch,
  isInspectionOverdue,
  formatInspectionDate,
} from "./lga-inspection-filters"
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
import {
  Link,
  Navigate,
  useLocation,
  useSearch,
  useNavigate,
} from "@tanstack/react-router"
import { AssignedAccountSignIn } from "@/components/shared/assigned-account-sign-in"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { PremisesAvatar } from "@/components/shared/premises-avatar"
import { VerifiedBusinessName } from "@/components/shared/verified-business-name"
import { Button } from "@/components/ui/button"
import { PremisesCertificateDetail } from "@/components/shared/premises-certificate-detail"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  buildMohBusinessDirectory,
  MohBusinessesDirectory,
  MohPremisesOverview,
} from "@/features/moh/moh-businesses"
import {
  assignedLgaAccount,
  assignedLgaCredentials,
  matchLgaAccount,
  verifyLgaCode,
} from "./lga-account"
import { useLga } from "./lga-session"
import { useLgaData } from "./use-lga-data"
import type { LgaApproval, LgaInspection } from "./lga-data"
import { LgaFilterBar, LgaSelect, daysSince, premisesHref } from "./lga-ui"

export function LgaSignInPage() {
  const session = useLga()

  return (
    <AssignedAccountSignIn
      account={assignedLgaAccount}
      credentials={assignedLgaCredentials}
      roleLabel="LGA Council"
      workspaceLabel="LGA Council"
      headline="Your council at a glance."
      description="View revenue, health approvals and premises within your LGA."
      destination="/lga/dashboard"
      session={session}
      matchAccount={matchLgaAccount}
      verifyCode={verifyLgaCode}
    />
  )
}

export function LgaPremisesPage() {
  const search = useSearch({ from: "/lga/_portal/premises" })
  const navigate = useNavigate({ from: "/lga/premises" })
  const { account } = useLga()
  const data = useLgaData()
  return (
    <div className="flex flex-col gap-6">
      {data.error && (
        <Alert variant="destructive">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
      <MohBusinessesDirectory
        filtersInDialog
        businesses={buildMohBusinessDirectory(
          data.premises,
          account?.councilId ?? ""
        ).map((business) => ({
          ...business,
          healthApproval: data.error
            ? "Unavailable"
            : healthApprovalStatus(
                data.premises.find((item) => item.id === business.id)!,
                data.approvals
              ),
        }))}
        healthApprovalFilter={{
          value: search.approval,
          onChange: (approval) => {
            void navigate({ search: { approval }, replace: true })
          },
        }}
        basePath="/lga/premises"
      />
    </div>
  )
}

function Unavailable({
  title,
  href,
  label,
}: {
  title: string
  href: string
  label: string
}) {
  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description="This record is unavailable in your council workspace."
      />
      <Link
        to={href}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {label}
      </Link>
    </div>
  )
}
export function LgaPremisesDetail({ premisesId }: { premisesId: string }) {
  const search = useLocation({ select: (location) => location.searchStr })
  const data = useLgaData()
  const premises = data.premises.find((item) => item.id === premisesId)
  const certificateId = new URLSearchParams(search).get("certificate")
  const certificate = premises?.certificates.find(
    (item) => item.id === certificateId
  )
  if (premises && certificate) {
    const backHref = premisesHref(premises.id)
    return (
      <PremisesCertificateDetail
        premises={premises}
        certificate={certificate}
        backHref={backHref}
        backLink={
          <Link
            to={backHref}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to premises certificates
          </Link>
        }
      />
    )
  }
  return premises ? (
    <div className="flex flex-col gap-6">
      <MohPremisesOverview
        premises={premises}
        basePath="/lga/premises"
        showDocuments={false}
      />
      {data.error && (
        <Alert variant="destructive">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
      {data.approvals
        .filter((item) => item.premisesId === premises.id)
        .map((item) => (
          <ApprovalSummary key={item.id} item={item} />
        ))}
    </div>
  ) : (
    <Unavailable
      title="Premises not found"
      href="/lga/premises"
      label="Back to premises"
    />
  )
}

export function LgaApprovalDetail({ caseId }: { caseId: string }) {
  const data = useLgaData()
  const item = data.approvals.find((approval) => approval.id === caseId)
  return item ? (
    <Navigate
      to="/lga/premises/$premisesId"
      params={{ premisesId: item.premisesId }}
      replace
    />
  ) : (
    <Unavailable
      title="Health Approval not found"
      href="/lga/premises"
      label="Back to premises"
    />
  )
}

function ApprovalSummary({ item }: { item: LgaApproval }) {
  const fields = [
    ["Reference", item.id],
    ["Ward", item.ward],
    ["Inspection reference", item.reference],
    ["Inspection completed", item.date],
    ["Officer", item.officer],
    ["Status", item.status],
    [
      "Waiting time",
      item.status === "Awaiting decision"
        ? `${daysSince(item.date)} days since inspection completion`
        : `${daysSince(item.date, item.decidedAt)} days to decision`,
    ],
    ...(item.decidedAt ? [["Decision date", item.decidedAt.slice(0, 10)]] : []),
    ...(item.certificateNumber
      ? [["Certificate number", item.certificateNumber]]
      : []),
    ...(item.reason ? [["Reason", item.reason]] : []),
  ]
  return (
    <section aria-label="Health Approval" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Health Approval</h2>
      <RecordDetails fields={fields} />
    </section>
  )
}

export function LgaInspectionsPage() {
  const data = useLgaData()
  const filters = useSearch({ from: "/lga/_portal/inspections" })
  const navigate = useNavigate({ from: "/lga/inspections" })
  const rows = selectInspections(data.inspections, filters)
  const active = Boolean(
    filters.q ||
    filters.ward ||
    filters.from ||
    filters.to ||
    filters.status !== "all"
  )
  const businessName = (item: LgaInspection) => (
    <VerifiedBusinessName
      name={item.businessName}
      verified={
        data.premises.find((premises) => premises.id === item.premisesId)
          ?.kybVerified ?? false
      }
    />
  )
  const view = (item: LgaInspection) => (
    <Button
      variant="outline"
      className="min-h-11"
      nativeButton={false}
      role="link"
      render={
        <Link
          to="/lga/inspections/$inspectionId"
          params={{ inspectionId: item.id }}
          search={filters}
        />
      }
    >
      View
      <ArrowRight data-icon="inline-end" aria-hidden="true" />
    </Button>
  )
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Inspections" divided={false} />
      <LgaFilterBar
        wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
        filters={filters}
        onChange={(next) => {
          void navigate({
            search: {
              ...filters,
              ...next,
              ward: next.ward,
              from: next.from,
              to: next.to,
            },
            replace: true,
          })
        }}
        dates
        dateLabels={["Scheduled from", "Scheduled to"]}
        hasActiveFilters={active}
        onClear={() => {
          void navigate({ search: validateInspectionSearch({}), replace: true })
        }}
        leading={
          <Field className="col-span-2 min-w-0 sm:w-72">
            <FieldLabel htmlFor="inspection-search" className="sr-only">
              Search premises or inspection reference
            </FieldLabel>
            <Input
              id="inspection-search"
              type="search"
              className="min-h-11"
              placeholder="Search premises or inspection reference"
              value={filters.q}
              onChange={(event) => {
                void navigate({
                  search: { ...filters, q: event.target.value },
                  replace: true,
                })
              }}
            />
          </Field>
        }
      >
        <LgaSelect
          label="Status"
          value={filters.status}
          onChange={(status) => {
            void navigate({ search: { ...filters, status }, replace: true })
          }}
          options={[
            { value: "all", label: "All statuses" },
            ...[
              ...new Set([
                ...data.inspections.map((item) => item.status),
                "Overdue",
              ]),
            ].map((value) => ({ value, label: value })),
          ]}
        />
      </LgaFilterBar>
      <p className="text-sm text-muted-foreground" role="status">
        {rows.length} {rows.length === 1 ? "inspection" : "inspections"}
      </p>
      {rows.length ? (
        <>
          <div className="hidden min-w-0 overflow-hidden rounded-xl border bg-card shadow-xs md:block">
            <Table aria-label="Inspections">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Business</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Inspection type</TableHead>
                  <TableHead>Scheduled date</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead className="px-4">Status</TableHead>
                  <TableHead className="px-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <LinkedTableRow key={item.id}>
                    <TableCell className="px-4 py-3 whitespace-normal">
                      <div className="flex items-center gap-3">
                        <PremisesAvatar name={item.businessName} />
                        <div className="min-w-0">
                          <p className="font-semibold">{businessName(item)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.ward}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="tabular-nums">
                      <time dateTime={item.scheduledAt}>
                        {formatInspectionDate(item.scheduledAt)}
                      </time>
                    </TableCell>
                    <TableCell>{item.officer}</TableCell>
                    <TableCell className="px-4">
                      <InspectionStatus item={item} />
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      {view(item)}
                    </TableCell>
                  </LinkedTableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul aria-label="Inspections" className="grid gap-3 md:hidden">
            {rows.map((item) => (
              <li key={item.id}>
                <Card size="sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <PremisesAvatar name={item.businessName} />
                      <div className="min-w-0">
                        <CardTitle>{businessName(item)}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.id} · {item.type}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <InspectionStatus item={item} />
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Ward</dt>
                        <dd>{item.ward}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Scheduled date
                        </dt>
                        <dd>
                          <time dateTime={item.scheduledAt}>
                            {formatInspectionDate(item.scheduledAt)}
                          </time>
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">Officer</dt>
                        <dd>{item.officer}</dd>
                      </div>
                    </dl>
                    {view(item)}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          title={
            active
              ? "No inspections match these filters"
              : "No inspections recorded yet"
          }
          description={
            active
              ? "Change or clear the filters to see more inspections."
              : "Inspections will appear here when they are scheduled."
          }
        />
      )}
    </div>
  )
}
function InspectionStatus({ item }: { item: LgaInspection }) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status={item.status} />
      {isInspectionOverdue(item) && (
        <Badge variant="destructive">Overdue</Badge>
      )}
    </div>
  )
}

export function LgaInspectionDetail({
  inspectionId,
}: {
  inspectionId: string
}) {
  const filters = useSearch({ from: "/lga/_portal/inspections_/$inspectionId" })
  const data = useLgaData()
  const item = data.inspections.find(
    (inspection) => inspection.id === inspectionId
  )
  if (!item)
    return (
      <Unavailable
        title="Inspection not found"
        href="/lga/inspections"
        label="Back to inspections"
      />
    )
  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/lga/inspections"
        search={filters}
        className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
      >
        Back to inspections
      </Link>
      <PageHeader
        title={item.businessName}
        description={`${item.type} · ${item.id}`}
        actions={<InspectionStatus item={item} />}
      />
      <RecordDetails
        fields={[
          ["Ward", item.ward],
          ["Officer", item.officer],
          ["Scheduled date", formatInspectionDate(item.scheduledAt)],
          ["Open findings at premises", String(item.outstandingContraventions)],
        ]}
      />
      <Link
        to={premisesHref(item.premisesId)}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
      >
        View premises
      </Link>
    </div>
  )
}
function RecordDetails({ fields }: { fields: string[][] }) {
  return (
    <dl className="max-w-3xl divide-y">
      {fields.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 py-4 text-sm sm:grid-cols-[12rem_1fr]"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
