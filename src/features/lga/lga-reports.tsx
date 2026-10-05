import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { ArrowLeft, Download } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getLgaReports,
  findLgaReport,
  reportCategories,
} from "./lga-report-library"
import type { LgaReport, ReportCategory } from "./lga-report-library"
import { useLga } from "./lga-session"

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))

export function LgaReportsPage() {
  const { account } = useLga()
  const search = useSearch({ from: "/lga/_portal/reports" })
  const navigate = useNavigate({ from: "/lga/reports" })
  const [error, setError] = useState("")
  const reports = getLgaReports(account?.councilId, search.category, search.q)
  const selected = search.report
    ? findLgaReport(account?.councilId, search.report)
    : undefined

  function download(report: LgaReport) {
    try {
      const url = URL.createObjectURL(
        new Blob([report.content], { type: "text/plain;charset=utf-8" })
      )
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = report.filename
      document.body.append(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setError("")
    } catch {
      setError("Unable to download this report. Please try again.")
    }
  }
  const downloadButton = (report: LgaReport) => (
    <Button
      variant="outline"
      className="min-h-11"
      aria-label={`Download ${report.title}`}
      onClick={() => download(report)}
    >
      <Download data-icon="inline-start" aria-hidden="true" />
      Download
    </Button>
  )
  const actions = (report: LgaReport) => (
    <div className="flex flex-wrap gap-2 md:justify-end">
      <Button
        variant="outline"
        className="min-h-11"
        nativeButton={false}
        aria-label={`View ${report.title}`}
        render={
          <Link to="/lga/reports" search={{ ...search, report: report.id }} />
        }
      >
        View
      </Button>
      {downloadButton(report)}
    </div>
  )
  if (search.report)
    return (
      <div className="flex min-w-0 flex-col gap-6">
        <Button
          variant="link"
          className="min-h-11 self-start px-0"
          nativeButton={false}
          render={
            <Link to="/lga/reports" search={{ ...search, report: undefined }} />
          }
        >
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to reports
        </Button>
        <PageHeader
          title={selected?.title ?? "Report not found"}
          divided={false}
          actions={selected ? downloadButton(selected) : undefined}
        />
        {selected ? (
          <>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Ward</dt>
                <dd>{selected.ward}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date uploaded</dt>
                <dd>
                  <time dateTime={selected.uploadedAt}>
                    {formatDate(selected.uploadedAt)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prepared by (MOH)</dt>
                <dd>{selected.preparedBy}</dd>
              </div>
            </dl>
            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Card>
              <CardContent>
                <section
                  aria-label="Report document"
                  className="text-sm leading-7 break-words whitespace-pre-wrap"
                >
                  {selected.content}
                </section>
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-muted-foreground">
            This report is unavailable in your council workspace.
          </p>
        )}
      </div>
    )
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title="Reports" divided={false} />
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Tabs
        value={search.category}
        onValueChange={(category) => {
          setError("")
          void navigate({
            search: { ...search, category: category as ReportCategory },
          })
        }}
        className="min-w-0 gap-5"
      >
        <div className="w-full overflow-x-auto border-b">
          <TabsList
            variant="line"
            aria-label="Report type"
            className="h-11! min-w-max! justify-start gap-1 rounded-none p-0"
          >
            {reportCategories.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="min-h-11 flex-none rounded-none border-b-2 border-b-transparent px-4 transition-none after:hidden data-active:border-b-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <Field className="sm:max-w-sm">
          <FieldLabel htmlFor="report-search" className="sr-only">
            Search reports
          </FieldLabel>{" "}
          <Input
            id="report-search"
            type="search"
            aria-label="Search reports"
            placeholder="Search reports"
            value={search.q}
            onChange={(event) => {
              void navigate({
                search: { ...search, q: event.target.value },
                replace: true,
              })
            }}
          />
        </Field>
        {reportCategories.map(({ value, label }) => (
          <TabsContent key={value} value={value}>
            {reports.length ? (
              <>
                <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
                  <Table aria-label={`${label} reports`}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Ward</TableHead>
                        <TableHead>Date uploaded</TableHead>
                        <TableHead>Prepared by (MOH)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium whitespace-normal">
                            {report.title}
                          </TableCell>
                          <TableCell>{report.ward}</TableCell>
                          <TableCell>
                            <time dateTime={report.uploadedAt}>
                              {formatDate(report.uploadedAt)}
                            </time>
                          </TableCell>
                          <TableCell>{report.preparedBy}</TableCell>
                          <TableCell>{actions(report)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ul
                  aria-label={`${label} reports`}
                  className="grid gap-3 md:hidden"
                >
                  {reports.map((report) => (
                    <li key={report.id}>
                      <Card size="sm">
                        <CardHeader>
                          <CardTitle>{report.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                          <dl className="grid gap-2 text-sm">
                            <div>
                              <dt className="text-muted-foreground">Ward</dt>
                              <dd>{report.ward}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Date uploaded
                              </dt>
                              <dd>
                                <time dateTime={report.uploadedAt}>
                                  {formatDate(report.uploadedAt)}
                                </time>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">
                                Prepared by (MOH)
                              </dt>
                              <dd>{report.preparedBy}</dd>
                            </div>
                          </dl>
                          {actions(report)}
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState
                title={
                  search.q.trim()
                    ? "No matching reports"
                    : "No reports uploaded yet"
                }
                description={
                  search.q.trim()
                    ? "Try another report title."
                    : "Reports will appear here when they are uploaded."
                }
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
