import { Link } from "@tanstack/react-router"
import { EmptyState } from "./empty-state"
import { LinkedTableRow } from "./linked-table-row"
import { StatusBadge } from "./status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface HistoryRow {
  id: string
  date: string
  officer: string
  type: string
  status: string
  href?: string
  findings?: number | null
}

export function PremisesInspectionTable({
  entries,
}: {
  entries: HistoryRow[]
}) {
  const showFindings = entries.some((entry) => entry.findings != null)
  return (
    <section aria-label="Inspection history" className="min-w-0">
      {entries.length ? (
        <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
          <Table aria-label="Inspection history">
            <TableHeader>
              <TableRow>
                <TableHead>Date of inspection</TableHead>
                <TableHead>Field officer</TableHead>
                <TableHead>Inspection type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                {showFindings && <TableHead>Findings</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <LinkedTableRow key={entry.id}>
                  <TableCell className="tabular-nums">
                    <time dateTime={entry.date}>
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      }).format(new Date(entry.date))}
                    </time>
                  </TableCell>
                  <TableCell>
                    {entry.officer || "Officer unavailable"}
                  </TableCell>
                  <TableCell>
                    {/follow[\s-]?up/i.test(entry.type)
                      ? "Follow-up"
                      : "Inspection"}
                  </TableCell>
                  <TableCell>
                    {entry.href ? (
                      <Link
                        to={entry.href}
                        aria-label={`View ${entry.id} result`}
                        className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {entry.id}
                      </Link>
                    ) : (
                      <span className="font-medium">{entry.id}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                  {showFindings && (
                    <TableCell>
                      {entry.findings == null
                        ? "Not recorded"
                        : entry.findings === 0
                          ? "No findings recorded"
                          : `${entry.findings} finding${entry.findings === 1 ? "" : "s"} recorded`}
                    </TableCell>
                  )}
                </LinkedTableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="No inspection history"
          description="Inspection visits will appear here once recorded."
        />
      )}
    </section>
  )
}
