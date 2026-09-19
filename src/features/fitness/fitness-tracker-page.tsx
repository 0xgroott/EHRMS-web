import { useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useFitness } from "./fitness-context"
import { findApprovedFitnessFacility } from "./fitness-seeds"
import type { FitnessStage } from "./fitness-types"

export const fitnessStageLabel: Record<FitnessStage, string> = {
  draft: "Draft application",
  review: "Ready for review",
  "awaiting-facility": "Awaiting facility result",
  "result-received": "Facility result received: Fit",
  issued: "Council decision: issued",
}

export function formatFitnessPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatFitnessReference(value: string) {
  return value
    .replace(/^DEMO-CERT(?=-|$)/, "FIT-CERT")
    .replace(/^DEMO-FITNESS-/, "FIT-PAY-")
    .replace(/^DEMO-PAY/, "FIT-PAY")
    .replaceAll("-DEMO-", "-")
}

export function FitnessLink({
  href,
  children,
  variant = "default",
}: {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline" | "link"
}) {
  return (
    <Button
      nativeButton={false}
      role="link"
      render={<a href={href} />}
      variant={variant}
      className="min-h-11 max-w-full text-left whitespace-normal"
    >
      {children}
    </Button>
  )
}

export function FitnessLoading() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <span className="sr-only">Loading Fitness records</span>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function FitnessEmptyState({
  title,
  description,
  href,
  label,
}: {
  title: string
  description: string
  href: string
  label: string
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <FitnessLink href={href}>{label}</FitnessLink>
    </Empty>
  )
}

export function FitnessTrackerPage() {
  const { state, isHydrated, recordFitResult, issueDemoCertificate } =
    useFitness()
  const { state: businessState } = useBusinessSession()
  const [error, setError] = useState("")
  if (!isHydrated) return <FitnessLoading />
  const application = state.application
  if (!application || ["draft", "review"].includes(application.stage)) {
    return (
      <FitnessEmptyState
        title="Your Fitness application is not submitted yet"
        description="Select your food handlers and facility, then review and confirm payment to start tracking."
        href="/business/fitness/apply"
        label={
          application
            ? "Continue Fitness application"
            : "Start Fitness application"
        }
      />
    )
  }
  const facility = findApprovedFitnessFacility(application.facilityId ?? "")
  const people = state.handlers.filter((handler) =>
    application.handlerIds.includes(handler.id)
  )
  const resultReceived =
    application.stage === "result-received" || application.stage === "issued"
  const issued = application.stage === "issued"
  const timeline = [
    { label: "Application prepared", complete: true },
    { label: "Payment confirmed", complete: true },
    { label: "Facility result received: Fit", complete: resultReceived },
    { label: "Council decision: issued", complete: issued },
  ]
  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-6 break-words">
      <PageHeader
        eyebrow="Fitness application tracker"
        title={fitnessStageLabel[application.stage]}
        description={
          issued
            ? "The council decision is complete. Your certificate details are available."
            : resultReceived
              ? "Next step owner: Council. The Fit result is ready for an issuance decision."
              : "Next step owner: Approved facility. Coordinate attendance using the contact details below."
        }
      />
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary">Application submitted</Badge>
        <Badge variant="outline">Payment confirmed</Badge>
      </div>
      {issued && (
        <div>
          <FitnessLink href="/business/fitness/certificate">
            View Fitness Certificate
          </FitnessLink>
        </div>
      )}
      <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_18rem]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Application details</h2>
            </CardTitle>
            <CardDescription>
              {businessState.profile?.premises?.premisesName}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <section>
              <h3 className="text-sm text-muted-foreground">
                Selected food handlers
              </h3>
              <ul className="mt-2 flex flex-col gap-1">
                {people.map((handler) => (
                  <li key={handler.id}>
                    {handler.fullName}{" "}
                    <span className="text-sm text-muted-foreground">
                      · {handler.role}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="text-sm text-muted-foreground">
                Approved facility
              </h3>
              <p className="mt-2 font-medium">{facility?.name}</p>
              <p className="text-sm text-muted-foreground">
                {facility?.location}
              </p>
              <p className="mt-1 text-sm">Contact: {facility?.contact}</p>
            </section>
            <dl className="flex flex-col gap-3 border-t pt-4">
              <div>
                <dt className="text-sm text-muted-foreground">Payment total</dt>
                <dd className="mt-1 font-medium">
                  {formatFitnessPrice(application.totalNgn ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Payment reference
                </dt>
                <dd className="mt-1 break-all">
                  {formatFitnessReference(application.paymentReference ?? "")}
                </dd>
              </div>
            </dl>
            <p className="text-sm text-muted-foreground">
              No money was collected. This payment reference is for this
              simulation only.
            </p>
          </CardContent>
        </Card>
        <section aria-label="Application timeline" className="min-w-0">
          <h2 className="mb-4 font-semibold">Progress</h2>
          <ol className="flex flex-col gap-5">
            {timeline.map((item, index) => (
              <li key={item.label} className="flex items-start gap-3">
                <Badge variant={item.complete ? "secondary" : "outline"}>
                  {index + 1}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.complete ? "Complete" : "Pending"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <section aria-labelledby="fitness-simulation-controls-title">
        <Card>
          <CardHeader>
            <Badge variant="outline">Simulation only</Badge>
            <CardTitle>
              <h2 id="fitness-simulation-controls-title">
                Facility and council actions
              </h2>
            </CardTitle>
            <CardDescription>
              The controls below simulate actions by the facility and council.
              They do not submit real results or issue an official certificate.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                variant="outline"
                className="min-h-11 whitespace-normal"
                disabled={application.stage !== "awaiting-facility"}
                onClick={() => {
                  const result = recordFitResult()
                  setError(result.ok ? "" : result.error)
                }}
              >
                Simulate facility Fit result
              </Button>
              <Button
                variant="outline"
                className="min-h-11 whitespace-normal"
                disabled={application.stage !== "result-received"}
                onClick={() => {
                  const result = issueDemoCertificate()
                  setError(result.ok ? "" : result.error)
                }}
              >
                Simulate council issuance
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {issued
                ? "Both external steps are complete."
                : resultReceived
                  ? "The facility result is recorded. The council decision can now be made."
                  : "Record a Fit result for all selected handlers before the council decision."}
            </p>
          </CardContent>
        </Card>
      </section>
      <div>
        <FitnessLink href="/business/applications" variant="link">
          Back to applications
        </FitnessLink>
      </div>
    </div>
  )
}
