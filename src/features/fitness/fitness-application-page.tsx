import { useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import { paymentReceiptDocument } from "@/domain/business-document-downloads"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notifySuccess } from "@/components/ui/app-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { useFitness } from "./fitness-context"
import { useFumigation } from "@/features/fumigation/fumigation-context"
import {
  FumigationLink,
  fumigationStageLabel,
} from "@/features/fumigation/fumigation-shared"
import { handlerReadiness } from "./fitness-rules"
import {
  APPROVED_FITNESS_FACILITIES,
  findApprovedFitnessFacility,
} from "./fitness-seeds"
import {
  FitnessEmptyState,
  FitnessLink,
  FitnessLoading,
  formatFitnessPrice,
  fitnessStageLabel,
} from "./fitness-tracker-page"

type Step = "people" | "facility" | "review" | "payment"

export function FitnessApplicationPage({
  onPaid,
  inDrawer = false,
}: {
  onPaid?: () => void
  inDrawer?: boolean
}) {
  const { state, isHydrated } = useFitness()
  if (!isHydrated) return <FitnessLoading />
  if (
    state.application &&
    !["draft", "review"].includes(state.application.stage)
  ) {
    if (state.application.stage === "issued") {
      return (
        <FitnessEmptyState
          title="Fitness certificate issued"
          description="Your certificate is available. Start a renewal from its details when you are ready."
          href="/business/fitness/certificate"
          label="View Fitness Certificate"
        />
      )
    }
    return (
      <FitnessEmptyState
        title="Your Fitness application is underway"
        description="Track the facility result and council decision for your selected food handlers."
        href="/business/fitness/tracker"
        label="Track Fitness application"
      />
    )
  }
  return <ApplicationSteps onPaid={onPaid} inDrawer={inDrawer} />
}

function ApplicationSteps({
  onPaid,
  inDrawer,
}: {
  onPaid?: () => void
  inDrawer: boolean
}) {
  const { state, selectHandlers, chooseFacility, confirmDemoPayment } =
    useFitness()
  const currentHandlers = state.handlers.filter(
    (handler) => !handler.archivedAt
  )
  const { state: businessState } = useBusinessSession()
  const premises = businessState.profile?.premises
  const [step, setStep] = useState<Step>(
    state.application?.stage === "review"
      ? "review"
      : state.application
        ? "facility"
        : "people"
  )
  const [selectedIds, setSelectedIds] = useState(
    state.application?.handlerIds ?? []
  )
  const [facilityId, setFacilityId] = useState(
    state.application?.facilityId ?? ""
  )
  const [error, setError] = useState("")
  const facility = findApprovedFitnessFacility(facilityId)
  const selectedHandlers = currentHandlers.filter((handler) =>
    selectedIds.includes(handler.id)
  )
  const titles: Record<Step, string> = {
    people: "Select food handlers",
    facility: "Choose an approved facility",
    review: "Review your application",
    payment: "Payment",
  }
  const steps: Step[] = ["people", "facility", "review", "payment"]
  function go(next: Step) {
    setError("")
    setStep(next)
  }
  function continuePeople() {
    const result = selectHandlers(selectedIds)
    if (!result.ok) return setError(result.error)
    go("facility")
  }
  function review() {
    const result = chooseFacility(facilityId)
    if (!result.ok) return setError(result.error)
    go("review")
  }
  function pay() {
    const result = confirmDemoPayment()
    if (!result.ok) return setError(result.error)
    notifySuccess("Fitness application submitted")
    onPaid?.()
  }
  return (
    <div className="flex max-w-4xl min-w-0 flex-col gap-6 break-words">
      {inDrawer ? (
        <h2 className="text-xl font-semibold tracking-tight">{titles[step]}</h2>
      ) : (
        <PageHeader
          eyebrow="Fitness application"
          title={titles[step]}
          description="Apply for the food handlers at your current premises."
        />
      )}
      <ol
        aria-label="Application steps"
        className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"
      >
        {steps.map((item, index) => (
          <li
            key={item}
            aria-current={item === step ? "step" : undefined}
            className={
              item === step
                ? "font-semibold text-primary"
                : "text-muted-foreground"
            }
          >
            {index + 1}.{" "}
            {item === "people"
              ? "Food handlers"
              : item === "facility"
                ? "Facility"
                : item === "review"
                  ? "Review"
                  : "Payment"}
          </li>
        ))}
      </ol>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {step === "people" && (
        <>
          {currentHandlers.length === 0 ? (
            <FitnessEmptyState
              title="Add food handlers first"
              description="Save staff records with identity, job role, phone, and consent before applying."
              href="/business/food-handlers"
              label="Manage food handlers"
            />
          ) : (
            <>
              <FieldSet>
                <FieldLegend>
                  Food handlers at {premises?.premisesName}
                </FieldLegend>
                <FieldDescription>
                  Select one or more eligible people. Incomplete records need
                  updating before selection.
                </FieldDescription>
                <FieldGroup className="gap-3">
                  {currentHandlers.map((handler) => {
                    const readiness = handlerReadiness(handler)
                    return (
                      <Field
                        key={handler.id}
                        orientation="horizontal"
                        data-disabled={!readiness.ready}
                        className="min-h-16 rounded-lg border p-4"
                      >
                        <Checkbox
                          id={`select-${handler.id}`}
                          disabled={!readiness.ready}
                          checked={selectedIds.includes(handler.id)}
                          onCheckedChange={(checked) => {
                            setError("")
                            setSelectedIds((ids) =>
                              checked
                                ? [...ids, handler.id]
                                : ids.filter((id) => id !== handler.id)
                            )
                          }}
                          aria-describedby={`readiness-${handler.id}`}
                        />
                        <FieldContent>
                          <FieldLabel
                            htmlFor={`select-${handler.id}`}
                            className="min-h-6"
                          >
                            {handler.fullName}
                          </FieldLabel>
                          <FieldDescription>
                            {handler.role || "Role needed"}
                          </FieldDescription>
                          <FieldDescription id={`readiness-${handler.id}`}>
                            {readiness.ready
                              ? "Ready to apply"
                              : readiness.reasons.join(" · ")}
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    )
                  })}
                </FieldGroup>
              </FieldSet>
              <p role="status" className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="min-h-11" onClick={continuePeople}>
                  Continue to facility
                </Button>
                <FitnessLink href="/business/food-handlers" variant="outline">
                  Manage food handlers
                </FitnessLink>
              </div>
            </>
          )}
        </>
      )}
      {step === "facility" && (
        <>
          <FieldSet>
            <FieldLegend>Approved facilities</FieldLegend>
            <FieldDescription>
              Each option shows one approved total for this application. Contact
              the selected facility after payment to coordinate attendance.
            </FieldDescription>
            <FieldGroup className="gap-3">
              {APPROVED_FITNESS_FACILITIES.map((option) => (
                <Field
                  key={option.id}
                  orientation="horizontal"
                  className="rounded-lg border p-4"
                >
                  <input
                    type="radio"
                    className="mt-1 size-4 shrink-0 accent-primary"
                    name="fitness-facility"
                    id={option.id}
                    checked={facilityId === option.id}
                    onChange={() => {
                      setFacilityId(option.id)
                      setError("")
                    }}
                    aria-describedby={`${option.id}-details`}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={option.id} className="min-h-6">
                      {option.name}
                    </FieldLabel>
                    <FieldDescription id={`${option.id}-details`}>
                      {option.location}
                      <br />
                      {option.service}
                      <br />
                      Contact: {option.contact}
                    </FieldDescription>
                    <p className="mt-2 text-sm font-semibold">
                      {formatFitnessPrice(option.priceNgn)} total
                    </p>
                  </FieldContent>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>
          <div className="flex flex-wrap gap-3">
            <Button className="min-h-11" onClick={review}>
              Review application
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => go("people")}
            >
              Change food handlers
            </Button>
          </div>
        </>
      )}
      {(step === "review" || step === "payment") && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Application summary</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Premises</dt>
                  <dd className="mt-1 font-medium">{premises?.premisesName}</dd>
                  <dd className="text-sm text-muted-foreground">
                    {premises?.address}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Food handlers · {selectedHandlers.length}
                  </dt>
                  <dd>
                    <ul className="mt-1 flex flex-col gap-1">
                      {selectedHandlers.map((handler) => (
                        <li key={handler.id}>{handler.fullName}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Facility</dt>
                  <dd className="mt-1 font-medium">{facility?.name}</dd>
                  <dd className="text-sm text-muted-foreground">
                    {facility?.location}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Service</dt>
                  <dd className="mt-1">{facility?.service}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <span className="font-medium">Total for this application</span>
                <span className="text-xl font-semibold">
                  {formatFitnessPrice(state.application?.totalNgn ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
          {step === "review" ? (
            <div className="flex flex-wrap gap-3">
              <Button className="min-h-11" onClick={() => go("payment")}>
                Proceed to payment
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => go("facility")}
              >
                Change facility
              </Button>
              <Button
                variant="ghost"
                className="min-h-11"
                onClick={() => go("people")}
              >
                Change food handlers
              </Button>
            </div>
          ) : (
            <>
              <Alert>
                <AlertDescription>
                  <Badge variant="secondary">Payment</Badge>
                  <p>
                    Check the amount and selected facility before confirming
                    payment. Payment starts the assessment; a certificate is
                    issued only after the required decisions.
                  </p>
                </AlertDescription>
              </Alert>
              <div className="flex flex-wrap gap-3">
                <Button className="min-h-11" onClick={pay}>
                  Confirm payment
                </Button>
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={() => go("review")}
                >
                  Back to review
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export function BusinessApplicationsPage() {
  const { state, isHydrated } = useFitness()
  const { state: businessState } = useBusinessSession()
  const { state: fumigation, isHydrated: fumigationIsHydrated } =
    useFumigation()
  if (!isHydrated || !fumigationIsHydrated) return <FitnessLoading />
  const application = state.application
  const fumigationApplication = fumigation.application
  const fumigationSubmitted =
    fumigationApplication &&
    !["draft", "review"].includes(fumigationApplication.stage)
  const submitted =
    application && !["draft", "review"].includes(application.stage)
  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-6 break-words">
      <PageHeader
        eyebrow="Business portal"
        title="Applications"
        description="Prepare and track your certificate applications."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Fitness</h2>
          </CardTitle>
          <CardDescription>
            Assessment for the food handlers at your premises.
          </CardDescription>
          <Badge variant="secondary">
            {application ? fitnessStageLabel[application.stage] : "Not started"}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {application
              ? `${application.handlerIds.length} food ${application.handlerIds.length === 1 ? "handler" : "handlers"} selected`
              : "Select eligible food handlers and an approved facility to begin your Fitness application."}
          </p>
        </CardContent>
        <CardFooter>
          <FitnessLink
            href={
              application?.stage === "issued"
                ? "/business/fitness/certificate"
                : submitted
                  ? "/business/fitness/tracker"
                  : "/business/fitness/apply"
            }
          >
            {application?.stage === "issued"
              ? "View Fitness Certificate or renew"
              : submitted
                ? "Track Fitness application"
                : application
                  ? "Continue Fitness application"
                  : state.history?.length
                    ? "Start Fitness renewal"
                    : "Start Fitness application"}
          </FitnessLink>
        </CardFooter>
      </Card>
      {(state.history?.length ?? 0) > 0 && (
        <section
          aria-labelledby="fitness-application-history"
          className="space-y-3"
        >
          <h2
            id="fitness-application-history"
            className="text-lg font-semibold"
          >
            Fitness application history
          </h2>
          <ul className="divide-y rounded-lg border">
            {[...(state.history ?? [])].reverse().map((item) => (
              <li key={item.id} className="p-4 text-sm">
                <p className="font-medium">{item.id}</p>
                <p className="mt-1 text-muted-foreground">
                  {fitnessStageLabel[item.stage]} · {item.handlerIds.length}{" "}
                  food handlers
                </p>
                {item.paymentReference && (
                  <p className="mt-1 break-all">
                    Payment reference: {item.paymentReference}
                  </p>
                )}
                <DocumentDownloadButton
                  document={paymentReceiptDocument(
                    "Fitness",
                    item,
                    businessState.profile
                  )}
                >
                  Download payment record
                </DocumentDownloadButton>
                {item.certificate && (
                  <p className="mt-1 break-all">
                    Certificate: {item.certificate.id}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Fumigation</h2>
          </CardTitle>
          <CardDescription>
            Premises fumigation by a licensed provider.
          </CardDescription>
          <Badge variant="secondary">
            {fumigationApplication
              ? fumigationStageLabel[fumigationApplication.stage]
              : "Not started"}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {fumigationApplication
              ? `Requested service month: ${fumigationApplication.requestedPeriod}`
              : "Choose a provider and review the service total for your premises."}
          </p>
        </CardContent>
        <CardFooter>
          <FumigationLink
            href={
              fumigationApplication?.stage === "issued"
                ? "/business/fumigation/certificate"
                : fumigationSubmitted
                  ? "/business/fumigation/tracker"
                  : "/business/fumigation/apply"
            }
          >
            {fumigationApplication?.stage === "issued"
              ? "View Fumigation Certificate or renew"
              : fumigationSubmitted
                ? "Track Fumigation application"
                : fumigationApplication
                  ? "Continue Fumigation application"
                  : fumigation.history?.length
                    ? "Start Fumigation renewal"
                    : "Start Fumigation application"}
          </FumigationLink>
        </CardFooter>
      </Card>
      {(fumigation.history?.length ?? 0) > 0 && (
        <section
          aria-labelledby="fumigation-application-history"
          className="space-y-3"
        >
          <h2
            id="fumigation-application-history"
            className="text-lg font-semibold"
          >
            Fumigation application history
          </h2>
          <ul className="divide-y rounded-lg border">
            {[...(fumigation.history ?? [])].reverse().map((item) => (
              <li key={item.id} className="p-4 text-sm">
                <p className="font-medium">{item.id}</p>
                <p className="mt-1 text-muted-foreground">
                  {fumigationStageLabel[item.stage]} · {item.requestedPeriod}
                </p>
                {item.paymentReference && (
                  <p className="mt-1 break-all">
                    Payment reference: {item.paymentReference}
                  </p>
                )}
                <DocumentDownloadButton
                  document={paymentReceiptDocument(
                    "Fumigation",
                    item,
                    businessState.profile
                  )}
                >
                  Download payment record
                </DocumentDownloadButton>
                {item.certificate && (
                  <p className="mt-1 break-all">
                    Certificate: {item.certificate.id}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
