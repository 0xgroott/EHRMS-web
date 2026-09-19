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
import { useFumigation } from "./fumigation-context"
import { findLicensedProvider } from "./fumigation-seeds"
import {
  FumigationLink,
  FumigationLoading,
  formatNgn,
  fumigationStageLabel,
} from "./fumigation-shared"

export function FumigationTrackerPage() {
  const {
    state,
    isHydrated,
    recordProviderReport,
    confirmEho,
    issueCertificate,
  } = useFumigation()
  const { state: businessState } = useBusinessSession()
  const [error, setError] = useState("")
  if (!isHydrated) return <FumigationLoading />
  const application = state.application
  if (!application || ["draft", "review"].includes(application.stage)) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Fumigation Certificate"
          title="Application not submitted"
          description="Complete the provider selection and payment step to track your application."
        />
        <FumigationLink href="/business/fumigation/apply">
          {application ? "Continue application" : "Start application"}
        </FumigationLink>
      </div>
    )
  }
  const provider = findLicensedProvider(application.providerId ?? "")
  const stageIndex = [
    "awaiting-provider",
    "report-submitted",
    "eho-confirmed",
    "issued",
  ].indexOf(application.stage)
  const timeline = [
    {
      title: "Payment confirmed",
      detail: "Application submitted",
      complete: true,
    },
    {
      title: "Provider service and report",
      detail: application.workDate
        ? `Service date ${application.workDate}`
        : "Awaiting provider report",
      complete: stageIndex >= 1,
    },
    {
      title: "EHO confirmation",
      detail: stageIndex >= 2 ? "Report confirmed" : "Awaiting review",
      complete: stageIndex >= 2,
    },
    {
      title: "Council decision",
      detail: stageIndex >= 3 ? "Issued" : "Awaiting decision",
      complete: stageIndex >= 3,
    },
  ]
  function advance(
    action: () => { ok: true; value: unknown } | { ok: false; error: string }
  ) {
    const result = action()
    setError(result.ok ? "" : result.error)
  }
  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-7 pb-12">
      <PageHeader
        eyebrow="Fumigation application"
        title={fumigationStageLabel[application.stage]}
        description={
          application.stage === "issued"
            ? "The decision is complete. Your certificate is available below."
            : stageIndex >= 2
              ? "The council decision is the next step."
              : stageIndex >= 1
                ? "The report is ready for EHO confirmation."
                : "The provider service and report are the next steps."
        }
      />
      {application.stage === "issued" && (
        <div>
          <FumigationLink href="/business/fumigation/certificate">
            View Fumigation Certificate
          </FumigationLink>
        </div>
      )}
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <h2>Application details</h2>
            </CardTitle>
            <CardDescription>
              {businessState.profile?.premises?.premisesName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">
                  Licensed provider
                </dt>
                <dd className="mt-1 font-medium">{provider?.name}</dd>
                <dd className="text-sm text-muted-foreground">
                  {provider?.registrationNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Provider contact
                </dt>
                <dd className="mt-1">
                  <a
                    className="underline underline-offset-4"
                    href={`tel:${provider?.contact.replace(/[^+\d]/g, "")}`}
                  >
                    {provider?.contact}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Requested month
                </dt>
                <dd className="mt-1">{application.requestedPeriod}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Service date</dt>
                <dd className="mt-1">
                  {application.workDate ?? "To be confirmed"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Payment total</dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {formatNgn(application.totalNgn ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Payment reference
                </dt>
                <dd className="mt-1 break-all">
                  {application.paymentReference}
                </dd>
              </div>
            </dl>
            <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
              This payment reference records a simulated confirmation. No money
              was collected.
            </p>
          </CardContent>
        </Card>
        <section aria-label="Application progress" className="min-w-0">
          <h2 className="mb-5 font-semibold">Progress</h2>
          <ol className="space-y-0">
            {timeline.map((item, index) => (
              <li
                key={item.title}
                className="relative flex gap-3 pb-6 last:pb-0"
              >
                <span
                  className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs ${item.complete ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}
                >
                  {index + 1}
                </span>
                {index < timeline.length - 1 && (
                  <span className="absolute top-7 bottom-0 left-[13px] border-l" />
                )}
                <span>
                  <span className="block text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <section aria-labelledby="simulation-controls" className="border-t pt-6">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline">Simulation controls</Badge>
          <h2 id="simulation-controls" className="text-lg font-semibold">
            External actions
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            These controls demonstrate actions performed outside the business
            portal. They do not send a provider report, record an official EHO
            confirmation, or issue a council certificate.
          </p>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={application.stage !== "awaiting-provider"}
              onClick={() => advance(recordProviderReport)}
            >
              Simulate provider report
            </Button>
            <Button
              variant="outline"
              disabled={application.stage !== "report-submitted"}
              onClick={() => advance(confirmEho)}
            >
              Simulate EHO confirmation
            </Button>
            <Button
              variant="outline"
              disabled={application.stage !== "eho-confirmed"}
              onClick={() => advance(issueCertificate)}
            >
              Simulate council decision
            </Button>
          </div>
        </div>
      </section>
      <FumigationLink href="/business/applications" variant="link">
        Back to applications
      </FumigationLink>
    </div>
  )
}
