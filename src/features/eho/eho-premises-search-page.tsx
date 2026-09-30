import { useEffect, useRef, useState } from "react"
import { ArrowRight, Camera, MapPin, Search, X } from "lucide-react"
import type { ComplianceStatus, Premises } from "@/domain/types"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  belongsToOtherCouncil,
  referenceFromCode,
  searchPremises,
} from "./eho-premises-search"
import type { PremisesSort } from "./eho-premises-search"
import { EhoPremisesAvatar } from "./eho-premises-avatar"
import { useEho } from "./eho-session"

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}
type BarcodeDetectorConstructor = new (options: {
  formats: string[]
}) => BarcodeDetectorInstance

const complianceStatuses: ComplianceStatus[] = [
  "Compliant",
  "At Risk",
  "Non-compliant",
  "Not Found",
]

const sortOptions: Array<{ value: PremisesSort; label: string }> = [
  { value: "business-name", label: "Business name" },
  { value: "ward", label: "Ward" },
  { value: "business-type", label: "Business type" },
  { value: "status", label: "Status" },
]

function PremisesLink({ premises }: { premises: Premises }) {
  return (
    <Button
      variant="outline"
      className="min-h-11"
      nativeButton={false}
      render={
        <a
          href={`/eho/premises/${encodeURIComponent(premises.id)}?source=search`}
        />
      }
    >
      View
      <ArrowRight data-icon="inline-end" aria-hidden="true" />
    </Button>
  )
}

function MobilePremisesCard({ premises }: { premises: Premises }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={premises.complianceStatus} />
          <span className="text-xs text-muted-foreground">{premises.id}</span>
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold">{premises.businessName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {premises.premisesType} · {premises.ward}
          </p>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {premises.address}
          </p>
        </div>
        <PremisesLink premises={premises} />
      </CardContent>
    </Card>
  )
}

export function EhoPremisesSearchPage() {
  const { officer } = useEho()
  const [query, setQuery] = useState("")
  const [ward, setWard] = useState("all")
  const [premisesType, setPremisesType] = useState("all")
  const [complianceStatus, setComplianceStatus] = useState("all")
  const [sort, setSort] = useState<PremisesSort>("business-name")
  const [scanOpen, setScanOpen] = useState(false)
  const [code, setCode] = useState("")
  const [scanError, setScanError] = useState("")
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    []
  )

  const councilPremises = officer ? searchPremises("", officer.councilId) : []
  const wards = [...new Set(councilPremises.map((item) => item.ward))].sort()
  const premisesTypes = [
    ...new Set(councilPremises.map((item) => item.premisesType)),
  ].sort()
  const results = officer
    ? searchPremises(query, officer.councilId, {
        ward: ward === "all" ? undefined : ward,
        premisesType: premisesType === "all" ? undefined : premisesType,
        complianceStatus:
          complianceStatus === "all"
            ? undefined
            : (complianceStatus as ComplianceStatus),
        sort,
      })
    : []
  const controlsActive =
    !!query.trim() ||
    ward !== "all" ||
    premisesType !== "all" ||
    complianceStatus !== "all" ||
    sort !== "business-name"

  function resetDirectory() {
    setQuery("")
    setWard("all")
    setPremisesType("all")
    setComplianceStatus("all")
    setSort("business-name")
  }

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
    resetDirectory()
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Premises"
        description="Browse businesses registered with Port Harcourt City Council."
        divided={false}
      />

      <section aria-label="Find premises" className="flex flex-col gap-6">
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
              type="search"
              className="min-h-11 pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, reference, address, ward or type"
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
            <Camera data-icon="inline-start" aria-hidden="true" /> Scan code
          </Button>
        </div>

        <FieldGroup className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="premises-ward">Ward</FieldLabel>
            <Select
              items={[
                { value: "all", label: "All wards" },
                ...wards.map((item) => ({ value: item, label: item })),
              ]}
              value={ward}
              onValueChange={(value) => setWard(value ?? "all")}
            >
              <SelectTrigger
                id="premises-ward"
                aria-label="Filter by ward"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All wards</SelectItem>
                  {wards.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="premises-type">Business type</FieldLabel>
            <Select
              items={[
                { value: "all", label: "All business types" },
                ...premisesTypes.map((item) => ({ value: item, label: item })),
              ]}
              value={premisesType}
              onValueChange={(value) => setPremisesType(value ?? "all")}
            >
              <SelectTrigger
                id="premises-type"
                aria-label="Filter by business type"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All business types</SelectItem>
                  {premisesTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="premises-status">Status</FieldLabel>
            <Select
              items={[
                { value: "all", label: "All statuses" },
                ...complianceStatuses.map((status) => ({
                  value: status,
                  label: status,
                })),
              ]}
              value={complianceStatus}
              onValueChange={(value) => setComplianceStatus(value ?? "all")}
            >
              <SelectTrigger
                id="premises-status"
                aria-label="Filter by status"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All statuses</SelectItem>
                  {complianceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="premises-sort">Sort by</FieldLabel>
            <Select
              items={sortOptions}
              value={sort}
              onValueChange={(value) => setSort(value ?? "business-name")}
            >
              <SelectTrigger
                id="premises-sort"
                aria-label="Sort premises"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </section>

      {scanOpen && (
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
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
              className="min-h-11 w-fit"
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

      <section aria-label="Premises directory" className="flex flex-col gap-2">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{results.length} premises</p>
          {controlsActive && (
            <Button
              variant="ghost"
              className="min-h-11"
              onClick={resetDirectory}
            >
              {query.trim() &&
              ward === "all" &&
              premisesType === "all" &&
              complianceStatus === "all" &&
              sort === "business-name"
                ? "Clear search"
                : "Clear filters"}
            </Button>
          )}
        </div>

        {results.length ? (
          <>
            <div className="hidden overflow-hidden rounded-xl border bg-background md:block">
              <Table>
                <TableCaption className="sr-only">
                  Port Harcourt City Council premises
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Business type</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((premises) => (
                    <TableRow key={premises.id}>
                      <TableCell className="min-w-64 whitespace-normal">
                        <div className="flex items-center gap-3">
                          <EhoPremisesAvatar name={premises.businessName} />
                          <div className="min-w-0">
                            <span className="block font-medium">
                              {premises.businessName}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {premises.id} · {premises.address}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{premises.premisesType}</TableCell>
                      <TableCell>{premises.ward}</TableCell>
                      <TableCell>
                        <StatusBadge status={premises.complianceStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <PremisesLink premises={premises} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {results.map((premises) => (
                <MobilePremisesCard key={premises.id} premises={premises} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No premises found"
            description={
              officer && belongsToOtherCouncil(query, officer.councilId)
                ? "This reference belongs to another council."
                : "Try another search or clear one of the filters."
            }
          />
        )}
      </section>
    </div>
  )
}
