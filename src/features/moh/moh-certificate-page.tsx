import { Download, ShieldCheck } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PrintableBusinessDocument } from "@/domain/business-document-downloads"
import type { HealthApprovalDecision, MohSubmission } from "./moh-approvals"
import { assignedMohAccount } from "./moh-account"

type ApprovedDecision = Extract<HealthApprovalDecision, { outcome: "approved" }>

function formatCertificateDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

function QrMark({ value }: { value: string }) {
  let seed = 0
  for (const character of value)
    seed = (seed * 31 + character.charCodeAt(0)) >>> 0

  const inFinder = (row: number, column: number) =>
    (row < 7 && column < 7) ||
    (row < 7 && column > 13) ||
    (row > 13 && column < 7)
  const finderCell = (row: number, column: number) => {
    const localRow = row > 13 ? row - 14 : row
    const localColumn = column > 13 ? column - 14 : column
    const edge =
      localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6
    const centre =
      localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4
    return edge || centre
  }
  const cells = Array.from({ length: 21 * 21 }, (_, index) => {
    const row = Math.floor(index / 21)
    const column = index % 21
    if (inFinder(row, column)) return finderCell(row, column)
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed % 3 === 0
  })

  return (
    <svg
      data-testid="certificate-qr-mark"
      aria-hidden="true"
      viewBox="0 0 23 23"
      className="size-32 text-foreground sm:size-36"
    >
      <rect width="23" height="23" rx="1" className="fill-background" />
      {cells.map(
        (filled, index) =>
          filled && (
            <rect
              key={index}
              x={(index % 21) + 1}
              y={Math.floor(index / 21) + 1}
              width="1"
              height="1"
              fill="currentColor"
            />
          )
      )}
    </svg>
  )
}

function CertificateUnavailable() {
  return (
    <div className="flex max-w-xl flex-col gap-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Certificate unavailable
      </h1>
      <p className="text-sm text-muted-foreground">
        This certificate is not available because the Health Approval has not
        been issued or the submission could not be found.
      </p>
    </div>
  )
}

function certificateDownloadDocument(
  submission: MohSubmission,
  decision: ApprovedDecision
): PrintableBusinessDocument {
  const council = seedDatabase.councils.find(
    (item) => item.id === assignedMohAccount.councilId
  )

  return {
    title: "Health Approval Certificate",
    reference: decision.certificateNumber,
    filename: `health-approval-certificate-${decision.certificateNumber}.html`,
    sections: [
      {
        title: "Certificate details",
        rows: [
          { label: "Certificate number", value: decision.certificateNumber },
          {
            label: "Issue date",
            value: formatCertificateDate(decision.decidedAt),
          },
          { label: "Registered business", value: submission.businessName },
          { label: "Trading name", value: submission.tradingName },
          { label: "Premises", value: submission.premisesId },
          { label: "Address", value: submission.address },
          {
            label: "Inspection reference",
            value: submission.inspection.reference,
          },
          {
            label: "Issuing council",
            value: council
              ? `${council.name} Council`
              : assignedMohAccount.councilId,
          },
        ],
      },
    ],
  }
}

export function MohCertificateView({
  submission,
  decision,
}: {
  submission: MohSubmission
  decision: ApprovedDecision
}) {
  return (
    <main className="min-h-svh bg-muted/30 px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <div className="flex justify-end">
          <DocumentDownloadButton
            document={certificateDownloadDocument(submission, decision)}
            variant="default"
          >
            <Download data-icon="inline-start" aria-hidden="true" />
            Download certificate
          </DocumentDownloadButton>
        </div>
        <MohCertificateDocument submission={submission} decision={decision} />
      </div>
    </main>
  )
}

export function MohCertificateDocument({
  submission,
  decision,
}: {
  submission?: MohSubmission
  decision?: ApprovedDecision
}) {
  if (!submission || !decision) return <CertificateUnavailable />

  const council = seedDatabase.councils.find(
    (item) => item.id === assignedMohAccount.councilId
  )

  return (
    <Card className="min-w-0">
      <CardHeader className="border-b bg-accent/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Environmental Health Regulatory Case Management System
            </p>
            <CardTitle className="mt-4">
              <h1 className="text-2xl sm:text-3xl">
                Health Approval Certificate
              </h1>
            </CardTitle>
            <CardDescription className="mt-2">
              Official premises approval record
            </CardDescription>
          </div>
          <Badge variant="success">
            <ShieldCheck aria-hidden="true" /> Issued
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-8 pt-2 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start">
        <dl className="grid min-w-0 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">
              Certificate number
            </dt>
            <dd className="mt-1 text-lg font-semibold break-all">
              {decision.certificateNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Issue date</dt>
            <dd className="mt-1 font-medium">
              <time dateTime={decision.decidedAt}>
                {formatCertificateDate(decision.decidedAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              Registered business
            </dt>
            <dd className="mt-1 font-semibold">{submission.businessName}</dd>
            <dd className="text-sm text-muted-foreground">
              {submission.tradingName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Premises</dt>
            <dd className="mt-1 font-semibold">{submission.premisesId}</dd>
            <dd className="text-sm text-muted-foreground">
              {submission.address}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              Inspection reference
            </dt>
            <dd className="mt-1 font-medium">
              {submission.inspection.reference}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Issuing council</dt>
            <dd className="mt-1 font-medium">
              {council
                ? `${council.name} Council`
                : assignedMohAccount.councilId}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col items-start gap-2 sm:items-center">
          <QrMark value={decision.certificateNumber} />
          <p className="max-w-36 text-xs text-muted-foreground sm:text-center">
            Certificate record mark
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <p className="max-w-3xl text-sm text-muted-foreground">
          This certificate confirms that the named premises received Health
          Approval following the recorded environmental health inspection.
        </p>
      </CardFooter>
    </Card>
  )
}
