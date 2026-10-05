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
import { Link, useLocation } from "@tanstack/react-router"
import { useState } from "react"
import { AssignedAccountSignIn } from "@/components/shared/assigned-account-sign-in"
import { ArrowLeft } from "lucide-react"
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
import { filterLgaRows } from "./lga-data"
import type { LgaFilters } from "./lga-data"
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
  const { account } = useLga()
  const data = useLgaData()
  return (
    <MohBusinessesDirectory
      businesses={buildMohBusinessDirectory(
        data.premises,
        account?.councilId ?? ""
      )}
      basePath="/lga/premises"
    />
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
    <MohPremisesOverview
      premises={premises}
      basePath="/lga/premises"
      showDocuments={false}
    />
  ) : (
    <Unavailable
      title="Premises not found"
      href="/lga/premises"
      label="Back to premises"
    />
  )
}

export function LgaApprovalsPage() {
  const data = useLgaData()
  const [filters, setFilters] = useState<LgaFilters>({})
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const rows = filterLgaRows(
    data.approvals,
    filters,
    (item) => item.date
  ).filter(
    (item) =>
      (status === "all" || item.status === status) &&
      `${item.businessName} ${item.id} ${item.reference}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  )
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Health approvals" divided={false} />
      {data.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
      <LgaFilterBar
        wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
        filters={filters}
        onChange={setFilters}
        leading={
          <div className="col-span-2 w-full sm:w-72">
            <label htmlFor="approval-search" className="sr-only">
              Search health approvals
            </label>
            <Input
              id="approval-search"
              type="search"
              value={query}
              className="min-h-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search premises or reference"
            />
          </div>
        }
      >
        <LgaSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            ...["Awaiting decision", "Approved", "Denied"].map((value) => ({
              value,
              label: value,
            })),
          ]}
        />
      </LgaFilterBar>
      {rows.length ? (
        <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <Table aria-label="Health approvals">
            <TableHeader>
              <TableRow>
                <TableHead>Premises</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiting time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <LinkedTableRow key={item.id}>
                  <TableCell>
                    <span className="font-medium">{item.businessName}</span>
                  </TableCell>
                  <TableCell>{item.ward}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    {item.status === "Awaiting decision"
                      ? `${daysSince(item.date)} days`
                      : "Decision recorded"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                      to="/lga/health-approvals/$caseId"
                      params={{ caseId: item.id }}
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
          title="No health approvals found"
          description="Try another search or choose different filters."
        />
      )}
    </div>
  )
}

export function LgaApprovalDetail({ caseId }: { caseId: string }) {
  const data = useLgaData()
  const item = data.approvals.find((approval) => approval.id === caseId)
  if (!item)
    return (
      <Unavailable
        title="Health Approval not found"
        href="/lga/health-approvals"
        label="Back to health approvals"
      />
    )
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
    <div className="space-y-6">
      <Link
        to="/lga/health-approvals"
        className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
      >
        Back to health approvals
      </Link>
      <PageHeader
        title={item.businessName}
        description="Health Approval"
        actions={<StatusBadge status={item.status} />}
      />
      {data.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}
      <RecordDetails fields={fields} />
      <Link
        to={premisesHref(item.premisesId)}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
      >
        View premises
      </Link>
    </div>
  )
}

export function LgaInspectionsPage() {
  const data = useLgaData()
  const [filters, setFilters] = useState<LgaFilters>({})
  const [status, setStatus] = useState("all")
  const rows = filterLgaRows(
    data.inspections,
    filters,
    (item) => item.scheduledAt
  ).filter((item) => status === "all" || item.status === status)
  const openFindings = filterLgaRows(data.premises, {
    ward: filters.ward,
  }).reduce((total, item) => total + item.outstandingContraventions, 0)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inspections" divided={false} />
      <LgaFilterBar
        wards={[...new Set(data.premises.map((item) => item.ward))].sort()}
        filters={filters}
        onChange={setFilters}
        dates
      >
        <LgaSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All statuses" },
            ...[...new Set(data.inspections.map((item) => item.status))].map(
              (value) => ({ value, label: value })
            ),
          ]}
        />
      </LgaFilterBar>
      <p className="text-sm text-muted-foreground">
        {openFindings} open findings · {filters.ward ?? "All wards"}
      </p>
      {rows.length ? (
        <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <Table aria-label="Inspections">
            <TableHeader>
              <TableRow>
                <TableHead>Premises</TableHead>
                <TableHead>Inspection</TableHead>
                <TableHead>Scheduled date</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <LinkedTableRow key={item.id}>
                  <TableCell>{item.businessName}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.scheduledAt}</TableCell>
                  <TableCell>{item.officer}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
                      to="/lga/inspections/$inspectionId"
                      params={{ inspectionId: item.id }}
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
          title="No inspections found"
          description="Try another search or choose different filters."
        />
      )}
    </div>
  )
}

export function LgaInspectionDetail({
  inspectionId,
}: {
  inspectionId: string
}) {
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
    <div className="space-y-6">
      <Link
        to="/lga/inspections"
        className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
      >
        Back to inspections
      </Link>
      <PageHeader
        title={item.businessName}
        description={`${item.type} · ${item.id}`}
        actions={<StatusBadge status={item.status} />}
      />
      <RecordDetails
        fields={[
          ["Ward", item.ward],
          ["Officer", item.officer],
          ["Scheduled date", item.scheduledAt],
          ["Status", item.status],
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
