import { useState } from "react"
import { ArrowRight, CheckCircle2, Circle, ClipboardList } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { seedDatabase } from "@/data/seeds"
import { useFitness } from "@/features/fitness/fitness-context"
import { useFumigation } from "@/features/fumigation/fumigation-context"
import { useInspection } from "./inspection-context"

const stageDetails: Record<
  string,
  { label: string; detail: string; action: string }
> = {
  "notice-served": {
    label: "Inspection notice received",
    detail: "Read and acknowledge the inspection notice before the visit.",
    action: "View inspection notice",
  },
  "notice-acknowledged": {
    label: "Inspection scheduled",
    detail:
      "Your notice is acknowledged. The council inspection is the next step.",
    action: "View inspection details",
  },
  "findings-issued": {
    label: "Corrective actions required",
    detail:
      "Review each finding and record how it was corrected by its deadline.",
    action: "View required actions",
  },
  "corrections-recorded": {
    label: "Corrections recorded",
    detail: "The council can now schedule a follow-up inspection.",
    action: "View findings",
  },
  "follow-up-served": {
    label: "Follow-up notice received",
    detail: "Read and acknowledge the separate follow-up notice.",
    action: "View follow-up notice",
  },
  "follow-up-acknowledged": {
    label: "Follow-up inspection scheduled",
    detail: "Your follow-up notice is acknowledged. Await the council outcome.",
    action: "View follow-up details",
  },
  resolved: {
    label: "Findings resolved",
    detail: "The council decision is the remaining step.",
    action: "View inspection record",
  },
  "approval-issued": {
    label: "Health Approval issued",
    detail: "The council decision and certificate details are available below.",
    action: "View inspection record",
  },
  "further-action": {
    label: "Further action required",
    detail:
      "The follow-up outcome requires a separate council decision. Your existing certificates have not been automatically changed.",
    action: "View inspection record",
  },
}

function ActionLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Button
      nativeButton={false}
      role="link"
      render={<a href={href} />}
      className="min-h-11 max-w-full text-left whitespace-normal"
    >
      {children}
      <ArrowRight data-icon="inline-end" aria-hidden="true" />
    </Button>
  )
}

function DateValue({ value }: { value: string }) {
  const date = new Date(value)
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)}
    </time>
  )
}

export function HealthApprovalPage() {
  const { state: fitness, isHydrated: fitnessReady } = useFitness()
  const { state: fumigation, isHydrated: fumigationReady } = useFumigation()
  const {
    state,
    isHydrated: inspectionReady,
    scheduleNotice,
    issueApproval,
  } = useInspection()
  const { state: business } = useBusinessSession()
  const [error, setError] = useState("")

  if (!fitnessReady || !fumigationReady || !inspectionReady) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading Health Approval</span>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const fitnessIssued = fitness.application?.stage === "issued"
  const fumigationIssued = fumigation.application?.stage === "issued"
  const eligible = fitnessIssued && fumigationIssued
  const inspection = state.inspection
  const status = inspection ? stageDetails[inspection.stage] : undefined
  const certificate =
    inspection?.stage === "approval-issued" ? inspection.certificate : undefined
  const correctionsRequired =
    inspection?.stage === "findings-issued"
      ? inspection.findings.filter((finding) => !finding.correctionNote).length
      : 0
  const premises = business.profile?.premises
  const council = certificate
    ? seedDatabase.councils.find((item) => item.id === certificate.councilId)
    : undefined

  function advance(
    action: () => { ok: true; value: unknown } | { ok: false; error: string }
  ) {
    const result = action()
    setError(result.ok ? "" : result.error)
  }

  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-8 pb-12">
      <PageHeader
        eyebrow="Business certificates"
        title="Health Approval"
        description="Health Approval follows the Fitness and Fumigation requirements and a council inspection."
      />

      <section aria-labelledby="eligibility-heading" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="eligibility-heading" className="text-lg font-semibold">
            Eligibility
          </h2>
          <Badge variant="secondary">
            {eligible ? "Requirements met" : "Requirements incomplete"}
          </Badge>
        </div>
        <ul className="divide-y border-y" aria-label="Certificate requirements">
          {[
            {
              name: "Fitness Certificate",
              issued: fitnessIssued,
              href:
                fitness.application &&
                !["draft", "review"].includes(fitness.application.stage)
                  ? "/business/fitness/tracker"
                  : "/business/fitness/apply",
              action: "Complete Fitness requirement",
            },
            {
              name: "Fumigation Certificate",
              issued: fumigationIssued,
              href:
                fumigation.application &&
                !["draft", "review"].includes(fumigation.application.stage)
                  ? "/business/fumigation/tracker"
                  : "/business/fumigation/apply",
              action: "Complete Fumigation requirement",
            },
          ].map((requirement) => (
            <li
              key={requirement.name}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {requirement.issued ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 shrink-0 text-primary"
                  />
                ) : (
                  <Circle
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground"
                  />
                )}
                <span className="font-medium">{requirement.name}</span>
              </div>
              {requirement.issued ? (
                <span className="text-sm text-muted-foreground">Issued</span>
              ) : (
                <a
                  className="text-sm font-medium text-primary underline underline-offset-4"
                  href={requirement.href}
                >
                  {requirement.action}
                </a>
              )}
            </li>
          ))}
        </ul>
        {!eligible && (
          <p className="mt-4 text-sm text-muted-foreground">
            Complete the missing certificate{" "}
            {fitnessIssued || fumigationIssued ? "requirement" : "requirements"}{" "}
            before an inspection can be scheduled.
          </p>
        )}
      </section>

      <section
        aria-labelledby="inspection-heading"
        className="grid gap-6 border-t pt-7 md:grid-cols-[minmax(0,1fr)_14rem]"
      >
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Inspection pathway
          </p>
          <h2
            id="inspection-heading"
            className="text-xl font-semibold tracking-tight"
          >
            {status?.label ??
              (eligible
                ? "Awaiting inspection notice"
                : "Inspection pending eligibility")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {status?.detail ??
              (eligible
                ? "The council can serve an inspection notice once the requirements are met."
                : "Your inspection status will appear here after both certificates are issued.")}
          </p>
          {correctionsRequired > 0 && (
            <p className="mt-3 text-sm font-medium">
              {correctionsRequired}{" "}
              {correctionsRequired === 1
                ? "finding requires"
                : "findings require"}{" "}
              correction
            </p>
          )}
          {inspection && (
            <div className="mt-5">
              <ActionLink href="/business/inspections">
                {status?.action ?? "View inspection record"}
              </ActionLink>
            </div>
          )}
        </div>
        <div className="flex items-start gap-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <ClipboardList
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <div>
            <p className="text-sm font-medium">Current decision</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {certificate
                ? "Issued"
                : inspection?.stage === "further-action"
                  ? "Further action"
                  : "Pending"}
            </p>
          </div>
        </div>
      </section>

      {certificate && (
        <section aria-labelledby="certificate-heading" className="space-y-4">
          <Alert>
            <AlertTitle>Certificate simulation</AlertTitle>
            <AlertDescription>
              This issued outcome is part of the prototype. It is not an
              official council document and cannot be used for regulatory
              purposes.
            </AlertDescription>
          </Alert>
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="border-b bg-accent/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                    EHRCMS · Premises compliance
                  </p>
                  <CardTitle className="mt-3">
                    <h2 id="certificate-heading" className="text-2xl">
                      Health Approval Certificate
                    </h2>
                  </CardTitle>
                </div>
                <Badge variant="secondary">Issued</Badge>
              </div>
              <p className="mt-2 text-sm break-all text-muted-foreground">
                {certificate.id}
              </p>
            </CardHeader>
            <CardContent className="pt-7">
              <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Premises</dt>
                  <dd className="mt-1 font-semibold">
                    {premises?.premisesName ?? inspection?.premisesName}
                  </dd>
                  <dd className="text-sm">{premises?.address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Issuing council
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {council?.name ?? certificate.councilId}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Issue date</dt>
                  <dd className="mt-1">
                    <DateValue value={certificate.issuedAt} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Expiry date</dt>
                  <dd className="mt-1">
                    <DateValue value={certificate.expiresAt} />
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>
      )}

      {eligible && (!inspection || inspection.stage === "resolved") && (
        <section
          aria-label="Council simulation controls"
          className="border-t pt-6"
        >
          <h2 className="font-semibold">Council simulation controls</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            These controls represent council actions in the prototype. They do
            not serve a real notice or issue an official approval.
          </p>
          {error && (
            <Alert variant="destructive" className="mt-4" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="mt-4">
            {!inspection ? (
              <Button
                variant="outline"
                onClick={() => advance(() => scheduleNotice(eligible))}
              >
                Simulate inspection notice
              </Button>
            ) : (
              <Button variant="outline" onClick={() => advance(issueApproval)}>
                Simulate council issuance
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
