import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  FileText,
  MapPin,
} from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { assignments } from "./eho-model"
import { noticeFor } from "./eho-notice"
import { createTaskProgress, readTaskProgress } from "./eho-task-progress"
import type { InspectionTaskProgress } from "./eho-task-progress"
import { useEho } from "./eho-session"

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

export function EhoNoticePage({ inspectionId }: { inspectionId: string }) {
  const { officer, fieldwork } = useEho()
  const [savedProgress, setSavedProgress] =
    useState<InspectionTaskProgress | null>(null)
  const assignment = assignments.find(
    (item) =>
      item.id === inspectionId && item.officers.includes(officer?.name ?? "")
  )
  const notice = assignment ? noticeFor(assignment) : null
  const premises = seedDatabase.premises.find(
    (item) =>
      item.id === assignment?.premisesId &&
      item.councilId === officer?.councilId
  )

  useEffect(() => {
    if (!assignment || !officer) return
    setSavedProgress(readTaskProgress(localStorage, officer.id, assignment))
  }, [assignment, officer])

  if (!assignment || !notice || !premises)
    return (
      <EmptyState
        title="Notice unavailable"
        description="Choose an assigned inspection from My Work."
      />
    )

  const progress =
    savedProgress?.assignmentId === inspectionId
      ? savedProgress
      : createTaskProgress(assignment)
  const readyToInspect = Boolean(
    progress.acknowledgedAt && progress.appointmentDate
  )

  return (
    <div className="space-y-6">
      <Link
        to="/eho/inspections/$inspectionId"
        params={{ inspectionId }}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Inspection overview
      </Link>
      <PageHeader
        eyebrow={notice.reference}
        title="Inspection notice"
        description={`${premises.businessName} · ${assignment.type}`}
        actions={
          <StatusBadge
            status={progress.noticeSentAt ? "Served" : "Not served"}
          />
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle
              role="heading"
              aria-level={2}
              className="flex items-center gap-2 text-base"
            >
              <FileText className="size-5 text-primary" aria-hidden="true" />{" "}
              Visit covered by this notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
              <MapPin
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold">{premises.businessName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {premises.address} · {premises.ward}
                </p>
              </div>
            </div>
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              <Detail label="Inspection reference" value={assignment.id} />
              <Detail label="Notice reference" value={notice.reference} />
              <Detail
                label="Scheduled visit"
                value={progress.appointmentDate ?? "Not scheduled"}
              />
              <Detail label="Inspection type" value={assignment.type} />
            </dl>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="min-h-11"
                nativeButton={false}
                render={
                  <a
                    href={`/eho/premises/${encodeURIComponent(premises.id)}?inspection=${encodeURIComponent(inspectionId)}`}
                  />
                }
              >
                View premises <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle
                role="heading"
                aria-level={2}
                className="flex items-center gap-2 text-base"
              >
                <ClipboardCheck
                  className="size-5 text-primary"
                  aria-hidden="true"
                />{" "}
                Service record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <Detail label="Issued" value={notice.issuedAt} />
                <div className="border-t pt-4">
                  <Detail
                    label="Service"
                    value={
                      progress.noticeSentAt
                        ? `Served ${progress.noticeSentAt.slice(0, 10)}`
                        : "Awaiting service"
                    }
                  />
                </div>
                <div className="border-t pt-4">
                  <Detail
                    label="Business acknowledgement"
                    value={
                      progress.acknowledgedAt
                        ? `Acknowledged ${progress.acknowledgedAt.slice(0, 10)}`
                        : progress.noticeSentAt
                          ? "Awaiting acknowledgement"
                          : "Not available before service"
                    }
                  />
                </div>
                <div className="border-t pt-4">
                  <Detail
                    label="Assigned officers"
                    value={assignment.officers.join(", ")}
                  />
                </div>
              </dl>
            </CardContent>
          </Card>
          {!progress.noticeSentAt ? (
            <Alert role="status">
              <AlertDescription>
                The notice has not been served. Inspection fieldwork cannot
                begin until service is recorded.
              </AlertDescription>
            </Alert>
          ) : !progress.acknowledgedAt ? (
            <Alert role="status">
              <AlertDescription>
                The notice has been sent. The business must acknowledge receipt
                before an inspection appointment can be scheduled.
              </AlertDescription>
            </Alert>
          ) : !progress.appointmentDate ? (
            <Alert role="status">
              <AlertDescription>
                The business acknowledged the notice. Schedule the appointment
                from the inspection overview before starting fieldwork.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert role="status">
              <AlertDescription>
                The notice is served. Check the scheduled visit and premises
                before starting fieldwork.
              </AlertDescription>
            </Alert>
          )}
          {fieldwork[inspectionId]?.status === "submitted" ||
          fieldwork[inspectionId]?.status === "queued" ? (
            <Button
              className="min-h-11"
              nativeButton={false}
              render={
                <Link
                  to="/eho/inspections/$inspectionId/result"
                  params={{ inspectionId }}
                />
              }
            >
              View inspection result <ArrowRight aria-hidden="true" />
            </Button>
          ) : readyToInspect ? (
            <Button
              className="min-h-11"
              nativeButton={false}
              render={
                <Link
                  to="/eho/inspections/$inspectionId/checklist"
                  params={{ inspectionId }}
                />
              }
            >
              Start inspection <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button className="min-h-11" disabled>
              Start inspection <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
