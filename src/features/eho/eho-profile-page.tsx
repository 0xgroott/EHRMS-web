import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ClipboardList,
  CloudUpload,
  FileText,
  HardDrive,
  LogOut,
  RotateCcw,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
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

export function EhoProfilePage() {
  const { officer, fieldwork, signOut } = useEho()
  const [online, setOnline] = useState(true)
  const [summary, setSummary] = useState<DeviceWorkSummary>(emptySummary)
  const [storageError, setStorageError] = useState("")
  const [syncResult, setSyncResult] = useState("")
  const [confirmSignOut, setConfirmSignOut] = useState(false)

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
  const council = seedDatabase.councils.find(
    (item) => item.id === officer.councilId
  )
  const queued = Object.entries(fieldwork).filter(
    ([, record]) => record?.status === "queued"
  )

  function leave() {
    if (signOut()) window.location.assign("/")
  }

  return (
    <div className="space-y-6">
      <Link
        to="/eho/my-work"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> My Work
      </Link>
      <PageHeader
        eyebrow="Account and device"
        title="Profile / Sync"
        description="Your assigned account and work saved on this device."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle
                role="heading"
                aria-level={2}
                className="flex items-center gap-2 text-base"
              >
                <HardDrive className="size-5 text-primary" aria-hidden="true" />{" "}
                Device and sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  {online ? (
                    <Wifi className="size-5 text-primary" aria-hidden="true" />
                  ) : (
                    <WifiOff
                      className="size-5 text-amber-700"
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
                className="min-h-11"
                onClick={() => setSyncResult(syncMessage(navigator.onLine))}
              >
                <CloudUpload aria-hidden="true" /> Sync now
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
              <CardContent className="space-y-3">
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
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle
                role="heading"
                aria-level={2}
                className="flex items-center gap-2 text-base"
              >
                <UserRound className="size-5 text-primary" aria-hidden="true" />{" "}
                Assigned account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y text-sm">
                <div className="py-3 first:pt-0">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium">{officer.name}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-muted-foreground">Staff ID</dt>
                  <dd className="mt-1 font-medium">{officer.id}</dd>
                </div>
                <div className="py-3">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="mt-1 font-medium">
                    Environmental Health Officer
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-muted-foreground">Council</dt>
                  <dd className="mt-1 font-medium">
                    {council
                      ? `${council.name} Council`
                      : "Council unavailable"}
                  </dd>
                </div>
                <div className="pt-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1 font-medium break-all">
                    {officer.email}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <LogOut className="size-4 text-primary" aria-hidden="true" />
                <h2 className="font-semibold">Session</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Signing out keeps saved work on this device for your next
                sign-in.
              </p>
              {confirmSignOut ? (
                <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium">
                    {summary.savedRecords} saved{" "}
                    {summary.savedRecords === 1
                      ? "record stays"
                      : "records stay"}{" "}
                    on this device after sign-out.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onClick={() => setConfirmSignOut(false)}
                    >
                      Stay signed in
                    </Button>
                    <Button className="min-h-11" onClick={leave}>
                      Sign out anyway
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={() =>
                    summary.savedRecords ? setConfirmSignOut(true) : leave()
                  }
                >
                  Sign out
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
