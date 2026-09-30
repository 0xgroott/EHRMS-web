import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ClipboardList,
  CloudUpload,
  FileText,
  HardDrive,
  RotateCcw,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { summarizeDeviceWork, syncMessage } from "./eho-profile-state"
import type { DeviceWorkSummary } from "./eho-profile-state"
import { useEho } from "./eho-session"

const emptySummary: DeviceWorkSummary = {
  inspectionDrafts: 0,
  queuedInspections: 0,
  savedFollowUps: 0,
  savedReportReviews: 0,
  savedRecords: 0,
}

function StatusCount({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: LucideIcon
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <strong className="block text-xl font-semibold tabular-nums">
          {value}
        </strong>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

export function EhoSyncDataPage() {
  const { officer, fieldwork } = useEho()
  const [online, setOnline] = useState(true)
  const [summary, setSummary] = useState<DeviceWorkSummary>(emptySummary)
  const [storageError, setStorageError] = useState("")
  const [syncResult, setSyncResult] = useState("")

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  useEffect(() => {
    if (!officer) return
    try {
      setSummary(summarizeDeviceWork(localStorage, officer.id, fieldwork))
      setStorageError("")
    } catch {
      setStorageError("Saved work cannot be checked on this device right now.")
    }
  }, [officer, fieldwork])

  if (!officer) return null
  const queued = Object.entries(fieldwork).filter(
    ([, record]) => record?.status === "queued"
  )

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Device and connectivity"
        title="Sync Data"
        description="Review work saved on this device and its sync status."
      />
      <Card>
        <CardHeader>
          <CardTitle
            role="heading"
            aria-level={2}
            className="flex items-center gap-2 text-base"
          >
            <HardDrive className="size-5 text-primary" aria-hidden="true" />
            Device and sync
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              {online ? (
                <Wifi className="size-5 text-primary" aria-hidden="true" />
              ) : (
                <WifiOff
                  className="size-5 text-destructive"
                  aria-hidden="true"
                />
              )}
              <div>
                <p className="font-medium">
                  {online ? "Device online" : "Device offline"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {online
                    ? "Connection available"
                    : "Saved work remains available"}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Last sync: None recorded
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatusCount
              label="Inspection drafts"
              value={summary.inspectionDrafts}
              icon={ClipboardList}
            />
            <StatusCount
              label="Queued inspections"
              value={summary.queuedInspections}
              icon={CloudUpload}
            />
            <StatusCount
              label="Saved follow-ups"
              value={summary.savedFollowUps}
              icon={RotateCcw}
            />
            <StatusCount
              label="Report reviews"
              value={summary.savedReportReviews}
              icon={FileText}
            />
          </div>
          {storageError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{storageError}</AlertDescription>
            </Alert>
          )}
          {syncResult && (
            <Alert role="alert">
              <AlertDescription>{syncResult}</AlertDescription>
            </Alert>
          )}
          <Button
            className="self-start"
            onClick={() => setSyncResult(syncMessage(navigator.onLine))}
          >
            <CloudUpload data-icon="inline-start" aria-hidden="true" />
            Sync now
          </Button>
        </CardContent>
      </Card>
      {queued.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle role="heading" aria-level={2} className="text-base">
              Waiting to sync
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {queued.map(([id]) => (
              <Link
                key={id}
                to="/eho/inspections/$inspectionId"
                params={{ inspectionId: id }}
                className="flex min-h-11 items-center justify-between rounded-md border px-3 text-sm font-medium hover:bg-muted"
              >
                Inspection {id}
                <span className="text-xs text-muted-foreground">
                  Open record
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
