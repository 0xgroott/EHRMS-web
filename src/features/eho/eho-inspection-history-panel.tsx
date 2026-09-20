import { ArrowRight, ClipboardCheck } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import type { InspectionHistoryEntry } from "./eho-inspection-history"

export function EhoInspectionHistoryPanel({
  entries,
}: {
  entries: InspectionHistoryEntry[]
}) {
  return (
    <section aria-label="Inspection history">
      {entries.length === 0 ? (
        <EmptyState
          title="No previous inspection history"
          description="Completed visits for this premises will appear here."
        />
      ) : (
        <ol className="divide-y rounded-xl border bg-card px-5 sm:px-6">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-4 py-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheck className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{entry.type}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.id} · {entry.date}
                    </p>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {entry.officer || "Officer unavailable"}
                  {entry.findings !== null &&
                    ` · ${entry.findings === 0 ? "No findings recorded" : `${entry.findings} finding${entry.findings === 1 ? "" : "s"} recorded`}`}
                </p>
                {entry.href && (
                  <a
                    href={entry.href}
                    aria-label={`View ${entry.id} result`}
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    View result{" "}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
