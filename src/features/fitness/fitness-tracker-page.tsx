import { Link } from "@tanstack/react-router"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { CopyValueButton } from "@/components/shared/copy-value-button"
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
    <Link
      to={href}
      className={cn(
        buttonVariants({ variant }),
        "min-h-11 max-w-full text-left whitespace-normal"
      )}
    >
      {children}
    </Link>
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

function FitnessApprovalSuccessDialog({
  open,
  onOpenChange,
  title,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-sm text-center leading-6">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <DialogClose render={<Button type="button" />}>Continue</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FitnessTrackerPage() {
  const { state, isHydrated, recordFitResult, issueDemoCertificate } =
    useFitness()
  const { state: businessState } = useBusinessSession()
  const [error, setError] = useState("")
  const [approvalSuccess, setApprovalSuccess] = useState<
    "fitness" | "council" | null
  >(null)
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
  const currentStepIndex = issued ? -1 : resultReceived ? 3 : 2
  const timeline = [
    { label: "Submit application", complete: true },
    { label: "Confirm payment", complete: true },
    { label: "Facility test results", complete: resultReceived },
    { label: "Council decision", complete: issued },
  ]
  const statusDescription = issued
    ? "The council decision is complete. Your Fitness Certificate is ready to view."
    : resultReceived
      ? "Council review is next. Facility test results have been received for all staff in this application."
      : "The approved facility is handling this step. Contact the facility to coordinate staff attendance."
  const facilityPhone = facility?.contact.replace(/[^+\d]/g, "")
  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-5 break-words">
      <PageHeader
        eyebrow="Health Fitness Certificate"
        title="Application tracker"
        description="Track staff testing, payment, and the council decision."
        divided={false}
      />
      <Alert
        role="status"
        aria-label="Fitness application status"
        variant="status"
        className={cn(
          "has-data-[slot=alert-action]:pr-4",
          issued
            ? "md:has-data-[slot=alert-action]:pr-[22rem]"
            : "md:has-data-[slot=alert-action]:pr-[11rem]"
        )}
      >
        {issued ? <Check aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
        <AlertTitle>{fitnessStageLabel[application.stage]}</AlertTitle>
        <AlertDescription>{statusDescription}</AlertDescription>
        {(issued || (!resultReceived && facility)) && (
          <AlertAction className="static col-span-full mt-3 justify-self-start md:absolute md:top-1/2 md:right-3 md:col-auto md:mt-0 md:-translate-y-1/2 md:justify-self-auto">
            <div className="flex flex-wrap gap-2">
              {facility && (!resultReceived || issued) && (
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        type="button"
                        variant={issued ? "outline" : "default"}
                        className="min-h-11"
                      />
                    }
                  >
                    Contact facility
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact facility</DialogTitle>
                    </DialogHeader>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-muted-foreground">
                          Facility name
                        </dt>
                        <dd className="mt-1 font-medium">{facility.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">
                          Location
                        </dt>
                        <dd className="mt-1 font-medium">
                          {facility.location}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">
                          Phone number
                        </dt>
                        <dd className="mt-1 flex items-center gap-1 font-medium">
                          <a
                            className="underline-offset-4 hover:underline"
                            href={`tel:${facilityPhone}`}
                          >
                            {facility.contact}
                          </a>
                          <CopyValueButton
                            value={facility.contact}
                            label="phone number"
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">
                          Email address
                        </dt>
                        <dd className="mt-1 flex min-w-0 items-start gap-1 font-medium">
                          <a
                            className="min-w-0 break-all underline-offset-4 hover:underline"
                            href={`mailto:${facility.email}`}
                          >
                            {facility.email}
                          </a>
                          <CopyValueButton
                            value={facility.email}
                            label="email address"
                          />
                        </dd>
                      </div>
                    </dl>
                  </DialogContent>
                </Dialog>
              )}
              {issued && (
                <Link
                  to="/business/fitness/certificate"
                  className={cn(buttonVariants(), "min-h-11")}
                >
                  View Fitness Certificate
                </Link>
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
              <div>
                <dt className="text-sm text-muted-foreground">Business</dt>
                <dd className="mt-1 font-medium">
                  {businessState.profile?.premises?.premisesName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  Approved facility
                </dt>
                <dd className="mt-1 font-medium">{facility?.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Payment total</dt>
                <dd className="mt-1 font-medium tabular-nums">
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
            <a
              href="/business/fitness/payment-receipt"
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
            <CardDescription>Four steps to certification</CardDescription>
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
        aria-label="Staff in this application"
        className="min-w-0"
      >
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>
            <h2>Staff in this application</h2>
          </CardTitle>
          <Badge variant="secondary">
            {people.length} {people.length === 1 ? "person" : "people"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table aria-label="Staff included in this application">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((handler) => (
                <TableRow key={handler.id}>
                  <TableCell className="font-medium">
                    {handler.fullName}
                  </TableCell>
                  <TableCell>{handler.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <section aria-labelledby="fitness-external-steps-title">
        <Card size="sm">
          <CardHeader>
            <CardTitle>
              <h2 id="fitness-external-steps-title">Continue this flow</h2>
            </CardTitle>
            <CardDescription>
              {issued
                ? "This application has completed all approval steps."
                : resultReceived
                  ? "Approve the council decision to complete this application."
                  : "Approve the facility test results to move this application forward."}
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
                onClick={() => {
                  const approvingFitnessTest =
                    application.stage === "awaiting-facility"
                  const result = approvingFitnessTest
                    ? recordFitResult()
                    : issueDemoCertificate()
                  setError(result.ok ? "" : result.error)
                  if (result.ok) {
                    setApprovalSuccess(
                      approvingFitnessTest ? "fitness" : "council"
                    )
                  }
                }}
              >
                {resultReceived
                  ? "Approve council decision"
                  : "Approve Fitness Test"}
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
      <FitnessApprovalSuccessDialog
        open={approvalSuccess !== null}
        onOpenChange={(open) => {
          if (!open) setApprovalSuccess(null)
        }}
        title={
          approvalSuccess === "council"
            ? "Council decision approved"
            : "Fitness tests approved"
        }
        description={
          approvalSuccess === "council"
            ? "The council decision is complete and the Fitness Certificate is ready."
            : "Facility test results have been recorded for all staff in this application."
        }
      />
      <div>
        <FitnessLink href="/business/applications" variant="link">
          Back to applications
        </FitnessLink>
      </div>
    </div>
  )
}
