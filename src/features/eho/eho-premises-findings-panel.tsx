import { ArrowRight, ClipboardList } from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
import type { CapturedPremisesFinding } from "./eho-premises-findings"

export function EhoPremisesFindingsPanel({
  councilOutstanding,
  findings,
}: {
  councilOutstanding: number
  findings: CapturedPremisesFinding[]
}) {
  return (
    <section aria-label="Premises findings" className="space-y-5">
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Council findings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Council outstanding findings: {councilOutstanding}
            </p>
          </div>
          <span className="text-2xl font-semibold tabular-nums">
            {councilOutstanding}
          </span>
        </div>
        {councilOutstanding > 0 && (
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
            Detailed council finding records are not available on this device.
          </p>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-base font-semibold">
            {findings.length} captured finding
            {findings.length === 1 ? "" : "s"}
          </h2>
        </div>
        {findings.length === 0 ? (
          <p className="rounded-xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
            No captured findings on this device
          </p>
        ) : (
          <ol className="divide-y rounded-xl border bg-card px-5 sm:px-6">
            {findings.map((finding) => (
              <li
                key={`${finding.inspectionId}-${finding.id}`}
                className="py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                      {finding.checklistItem} · {finding.inspectionId}
                    </p>
                    <h3 className="mt-2 font-semibold">
                      {finding.description}
                    </h3>
                  </div>
                  <StatusBadge status={finding.status} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">
                      Required correction
                    </dt>
                    <dd className="mt-1">{finding.action}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Deadline recorded</dt>
                    <dd className="mt-1 font-medium">{finding.deadline}</dd>
                  </div>
                </dl>
                <a
                  href={`/eho/inspections/${encodeURIComponent(finding.inspectionId)}/findings`}
                  aria-label={`View ${finding.inspectionId} findings summary`}
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  View findings summary
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
