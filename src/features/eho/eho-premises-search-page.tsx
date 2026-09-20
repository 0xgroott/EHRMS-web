import { useEffect, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Clock3,
  MapPin,
  Search,
  X,
} from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import type { Premises } from "@/domain/types"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  belongsToOtherCouncil,
  readRecentPremises,
  referenceFromCode,
  searchPremises,
} from "./eho-premises-search"
import { useEho } from "./eho-session"

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}
type BarcodeDetectorConstructor = new (options: {
  formats: string[]
}) => BarcodeDetectorInstance

function PremisesRow({ premises }: { premises: Premises }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={premises.complianceStatus} />
            <span className="text-xs text-muted-foreground">{premises.id}</span>
          </div>
          <h3 className="font-semibold">{premises.businessName}</h3>
          <p className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {premises.address} · {premises.ward}
          </p>
        </div>
        <Button
          variant="outline"
          className="min-h-11 self-start sm:self-auto"
          nativeButton={false}
          render={
            <a
              href={`/eho/premises/${encodeURIComponent(premises.id)}?source=search`}
            />
          }
        >
          Open premises <ArrowRight aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}

export function EhoPremisesSearchPage() {
  const { officer } = useEho()
  const [query, setQuery] = useState("")
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [scanOpen, setScanOpen] = useState(false)
  const [code, setCode] = useState("")
  const [scanError, setScanError] = useState("")
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (officer) setRecentIds(readRecentPremises(localStorage, officer.id))
  }, [officer])
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    []
  )

  const results = officer ? searchPremises(query, officer.councilId) : []
  const recent = recentIds
    .map((id) =>
      seedDatabase.premises.find(
        (item) => item.id === id && item.councilId === officer?.councilId
      )
    )
    .filter((item): item is Premises => !!item)

  function stopCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  function findCode(value: string) {
    const reference = referenceFromCode(value)
    if (!reference) {
      setScanError("Enter a valid premises reference, such as PR-001.")
      return
    }
    setQuery(reference)
    setScanOpen(false)
    setScanError("")
    stopCamera()
  }

  async function startCamera() {
    const Detector = (
      window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }
    ).BarcodeDetector
    const mediaDevices = Reflect.get(navigator, "mediaDevices") as
      MediaDevices | undefined
    if (!Detector || !mediaDevices?.getUserMedia) {
      setScanError(
        "Camera scanning is unavailable on this device. Enter the premises reference below."
      )
      return
    }
    try {
      setScanError("")
      const stream = await mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      streamRef.current = stream
      if (!videoRef.current) {
        stopCamera()
        return
      }
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraActive(true)
      const detector = new Detector({ formats: ["qr_code", "code_128"] })
      const scan = async () => {
        if (!streamRef.current || !videoRef.current) return
        try {
          const matches = await detector.detect(videoRef.current)
          const reference = matches
            .map((item) => referenceFromCode(item.rawValue))
            .find(Boolean)
          if (reference) {
            findCode(reference)
            return
          }
        } catch {
          setScanError(
            "Could not read this code. Enter the premises reference below."
          )
          stopCamera()
          return
        }
        frameRef.current = requestAnimationFrame(scan)
      }
      frameRef.current = requestAnimationFrame(scan)
    } catch {
      stopCamera()
      setScanError(
        "Camera access is unavailable. Enter the premises reference below."
      )
    }
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
        eyebrow="Field reference"
        title="Premises Search"
        description="Find a premises by name, reference or address."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="premises-search" className="sr-only">
            Search premises
          </label>
          <Input
            id="premises-search"
            className="min-h-11 pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, reference or address"
          />
        </div>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => {
            setScanOpen((open) => !open)
            setScanError("")
            if (scanOpen) stopCamera()
          }}
        >
          <Camera aria-hidden="true" /> Scan code
        </Button>
      </div>
      {scanOpen && (
        <Card className="gap-0 py-0">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Find by code</h2>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Close code lookup"
                onClick={() => {
                  setScanOpen(false)
                  stopCamera()
                }}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Scan a premises code or enter its reference.
            </p>
            <video
              ref={videoRef}
              muted
              playsInline
              aria-label="Camera preview for premises code"
              className={`${cameraActive ? "block" : "hidden"} aspect-video w-full max-w-lg rounded-md bg-foreground object-cover`}
            />
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={cameraActive ? stopCamera : startCamera}
            >
              {cameraActive ? "Stop camera" : "Start camera"}
            </Button>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault()
                findCode(code)
              }}
            >
              <label htmlFor="premises-code" className="sr-only">
                Premises code
              </label>
              <Input
                id="premises-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="PR-001"
                className="min-h-11 max-w-sm"
              />
              <Button type="submit" className="min-h-11">
                Find premises
              </Button>
            </form>
            {scanError && (
              <Alert role="alert" variant="destructive">
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {query.trim() ? (
        <section className="space-y-3" aria-label="Search results">
          <p className="text-xs font-medium text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {results.length ? (
            results.map((premises) => (
              <PremisesRow key={premises.id} premises={premises} />
            ))
          ) : (
            <EmptyState
              title="No premises found"
              description={
                officer && belongsToOtherCouncil(query, officer.councilId)
                  ? "This reference belongs to another council."
                  : "Try another name, address or reference."
              }
            />
          )}
          {!results.length && (
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => setQuery("")}
            >
              Retry search
            </Button>
          )}
        </section>
      ) : (
        <section className="space-y-3" aria-label="Recent premises">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-semibold">Recent premises</h2>
          </div>
          {recent.length ? (
            recent.map((premises) => (
              <PremisesRow key={premises.id} premises={premises} />
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Premises you open will appear here for quick access.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
