import { useState } from "react"
import { Check, Clock3, ExternalLink } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CopyValueButton } from "../fitness/copy-value-button"
import { useFumigation } from "./fumigation-context"
import { findLicensedProvider } from "./fumigation-seeds"
import {
  FumigationLink,
  FumigationLoading,
  formatNgn,
  fumigationStageLabel,
} from "./fumigation-shared"

type ApprovalSuccess = "provider" | "eho" | "council" | null

function FumigationApprovalSuccessDialog({
  value,
  onOpenChange,
}: {
  value: ApprovalSuccess
  onOpenChange: (open: boolean) => void
}) {
  const content = {
    provider: {
      title: "Provider service confirmed",
      description:
        "The fumigation service report has been recorded and is ready for EHO confirmation.",
    },
    eho: {
      title: "EHO confirmation approved",
      description:
        "The service report has been confirmed and is ready for the council decision.",
    },
    council: {
      title: "Council decision approved",
      description:
        "The council decision is complete and the Fumigation Certificate is ready.",
    },
  } as const
  const selected = value ? content[value] : content.provider

  return (
    <Dialog open={value !== null} onOpenChange={onOpenChange}>
      <DialogContent className="fitness-success-dialog text-center sm:p-8">
        <div className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <div
            className="fitness-confetti pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <span className="fitness-confetti-piece" key={index} />
            ))}
          </div>
          <Check className="relative size-7" aria-hidden="true" />
        </div>
        <DialogHeader className="items-center">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {selected.title}
          </DialogTitle>
          <DialogDescription className="max-w-sm text-center leading-6">
            {selected.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <DialogClose render={<Button type="button" />}>Continue</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
  const [approvalSuccess, setApprovalSuccess] = useState<ApprovalSuccess>(null)

  if (!isHydrated) return <FumigationLoading />
  const application = state.application
  if (!application || ["draft", "review"].includes(application.stage)) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Fumigation Certificate"
          title="Application not submitted"
          description="Choose a licensed provider and confirm payment to start tracking."
          divided={false}
        />
        <FumigationLink href="/business/fumigation/apply">
          {application ? "Continue application" : "Start application"}
        </FumigationLink>
      </div>
    )
  }

  const provider = findLicensedProvider(application.providerId ?? "")
  const reportReceived = [
    "report-submitted",
    "eho-confirmed",
    "issued",
  ].includes(application.stage)
  const ehoConfirmed = ["eho-confirmed", "issued"].includes(application.stage)
  const issued = application.stage === "issued"
  const currentStepIndex = issued
    ? -1
    : ehoConfirmed
      ? 4
      : reportReceived
        ? 3
        : 2
  const timeline = [
    { label: "Submit application", complete: true },
    { label: "Confirm payment", complete: true },
    { label: "Provider service report", complete: reportReceived },
    { label: "EHO confirmation", complete: ehoConfirmed },
    { label: "Council decision", complete: issued },
  ]
  const statusDescription = issued
    ? "The council decision is complete. Your Fumigation Certificate is ready to view."
    : ehoConfirmed
      ? "Council review is next. The EHO has confirmed the provider service report."
      : reportReceived
        ? "EHO confirmation is next. The provider service report has been received."
        : "The selected provider is handling this step. Contact the provider to coordinate the service."
  const providerPhone = provider?.contact.replace(/[^+\d]/g, "")
  const currentStage = application.stage

  function advance() {
    const action =
      currentStage === "awaiting-provider"
        ? recordProviderReport
        : currentStage === "report-submitted"
          ? confirmEho
          : issueCertificate
    const success: Exclude<ApprovalSuccess, null> =
      currentStage === "awaiting-provider"
        ? "provider"
        : currentStage === "report-submitted"
          ? "eho"
          : "council"
    const result = action()
    setError(result.ok ? "" : result.error)
    if (result.ok) setApprovalSuccess(success)
  }

  const actionLabel =
    currentStage === "awaiting-provider"
      ? "Confirm provider service"
      : currentStage === "report-submitted"
        ? "Approve EHO confirmation"
        : "Approve council decision"

  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-5 break-words">
      <PageHeader
        eyebrow="Fumigation Certificate"
        title="Application tracker"
        description="Track provider service, payment, and the council decision."
        divided={false}
      />

      <Alert
        role="status"
        aria-label="Fumigation application status"
        variant="status"
        className={cn(
          "has-data-[slot=alert-action]:pr-4",
          issued
            ? "md:has-data-[slot=alert-action]:pr-[22rem]"
            : "md:has-data-[slot=alert-action]:pr-[11rem]"
        )}
      >
        {issued ? <Check aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
        <AlertTitle>{fumigationStageLabel[application.stage]}</AlertTitle>
        <AlertDescription>{statusDescription}</AlertDescription>
        {(provider || issued) && (
          <AlertAction className="static col-span-full mt-3 justify-self-start md:absolute md:top-1/2 md:right-3 md:col-auto md:mt-0 md:-translate-y-1/2 md:justify-self-auto">
            <div className="flex flex-wrap gap-2">
              {provider && !issued && (
                <Dialog>
                  <DialogTrigger
                    render={<Button type="button" className="min-h-11" />}
                  >
                    Contact provider
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact provider</DialogTitle>
                    </DialogHeader>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <Detail label="Provider name" value={provider.name} />
                      <Detail label="Location" value={provider.location} />
                      <div>
                        <dt className="text-sm text-muted-foreground">
                          Phone number
                        </dt>
                        <dd className="mt-1 flex items-center gap-1 font-medium">
                          <a
                            className="underline-offset-4 hover:underline"
                            href={`tel:${providerPhone}`}
                          >
                            {provider.contact}
                          </a>
                          <CopyValueButton
                            value={provider.contact}
                            label="phone number"
                          />
                        </dd>
                      </div>
                      <Detail
                        label="Licence number"
                        value={provider.registrationNumber}
                      />
                    </dl>
                  </DialogContent>
                </Dialog>
              )}
              {issued && (
                <a
                  href="/business/fumigation/certificate"
                  className={cn(buttonVariants(), "min-h-11")}
                >
                  View Fumigation Certificate
                </a>
              )}
            </div>
          </AlertAction>
        )}
      </Alert>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Card
          size="sm"
          role="region"
          aria-label="The business"
          className="min-w-0"
        >
          <CardHeader>
            <CardTitle>
              <h2>The business</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail
                label="Business"
                value={
                  application.premisesName ??
                  businessState.profile?.premises?.premisesName
                }
              />
              <Detail label="Licensed provider" value={provider?.name} />
              <Detail
                label="Payment total"
                value={formatNgn(application.totalNgn ?? 0)}
                tabular
              />
              <Detail
                label="Payment reference"
                value={application.paymentReference}
                breakAll
              />
            </dl>
            <a
              href="/business/fumigation/payment-receipt"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "link" }),
                "mt-3 h-auto self-start p-0"
              )}
            >
              View payment receipt
              <ExternalLink aria-hidden="true" />
            </a>
          </CardContent>
        </Card>

        <Card
          size="sm"
          role="region"
          aria-label="Application progress"
          className="min-w-0 self-start"
        >
          <CardHeader>
            <CardTitle>
              <h2>Progress</h2>
            </CardTitle>
            <CardDescription>Five steps to certification</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col">
              {timeline.map((item, index) => {
                const current = index === currentStepIndex
                return (
                  <li
                    key={item.label}
                    aria-current={current ? "step" : undefined}
                    className="relative flex items-start gap-3 pb-5 last:pb-0"
                  >
                    <Badge
                      variant={
                        item.complete
                          ? "secondary"
                          : current
                            ? "default"
                            : "outline"
                      }
                      className="size-7 rounded-full p-0"
                      aria-hidden="true"
                    >
                      {item.complete ? <Check /> : index + 1}
                    </Badge>
                    {index < timeline.length - 1 && (
                      <Separator
                        orientation="vertical"
                        className="absolute top-7 bottom-0 left-3.5 h-auto"
                      />
                    )}
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.complete ? "Complete" : "Pending"}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card
        size="sm"
        role="region"
        aria-label="Service details"
        className="min-w-0"
      >
        <CardHeader>
          <CardTitle>
            <h2>Service details</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Detail
              label="Requested month"
              value={application.requestedPeriod}
            />
            <Detail label="Service" value={provider?.service} />
            <Detail
              label="Service date"
              value={application.workDate ?? "To be confirmed"}
            />
          </dl>
        </CardContent>
      </Card>

      <section aria-labelledby="fumigation-external-steps-title">
        <Card size="sm">
          <CardHeader>
            <CardTitle>
              <h2 id="fumigation-external-steps-title">Continue this flow</h2>
            </CardTitle>
            <CardDescription>
              {issued
                ? "This application has completed all approval steps."
                : application.stage === "awaiting-provider"
                  ? "Confirm the provider service report to move this application forward."
                  : application.stage === "report-submitted"
                    ? "Approve the EHO confirmation before the council decision."
                    : "Approve the council decision to complete this application."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {issued ? (
              <Badge variant="secondary" className="w-fit">
                <Check aria-hidden="true" />
                Flow complete
              </Badge>
            ) : (
              <Button
                className="min-h-11 w-fit whitespace-normal"
                onClick={advance}
              >
                {actionLabel}
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      <FumigationApprovalSuccessDialog
        value={approvalSuccess}
        onOpenChange={(open) => {
          if (!open) setApprovalSuccess(null)
        }}
      />

      <div>
        <FumigationLink href="/business/applications" variant="link">
          Back to applications
        </FumigationLink>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  tabular = false,
  breakAll = false,
}: {
  label: string
  value?: string
  tabular?: boolean
  breakAll?: boolean
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-medium",
          tabular && "tabular-nums",
          breakAll && "break-all"
        )}
      >
        {value || "—"}
      </dd>
    </div>
  )
}
