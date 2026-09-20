import { useEffect, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  ClipboardCheck,
  Copy,
  CreditCard,
  Building2,
  Landmark,
  MapPin,
  Phone,
  UsersRound,
  Wallet,
} from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { DocumentDownloadButton } from "@/components/business/document-download-button"
import { paymentReceiptDocument } from "@/domain/business-document-downloads"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import {
  Field,
  FieldContent,
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
import { handlerReadiness, newStaffHandlers } from "./fitness-rules"
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
type PaymentMethod = "bank" | "paystack" | "card"

const PAYMENT_BANK = {
  name: "Civic Health Bank",
  accountNumber: "0000000000",
  accountName: "EHRCMS Service Collections",
} as const

export function FitnessApplicationPage({ onPaid }: { onPaid?: () => void }) {
  const { state, isHydrated } = useFitness()
  const [justSubmitted, setJustSubmitted] = useState(false)
  if (!isHydrated) return <FitnessLoading />
  if (justSubmitted) return <FitnessSubmissionSuccess />
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
  return (
    <ApplicationSteps
      onPaid={() => {
        setJustSubmitted(true)
        onPaid?.()
      }}
    />
  )
}

function ApplicationSteps({ onPaid }: { onPaid?: () => void }) {
  const { state, selectHandlers, chooseFacility, confirmDemoPayment } =
    useFitness()
  const currentHandlers =
    state.application?.purpose === "new-staff"
      ? newStaffHandlers(state)
      : state.handlers.filter((handler) => !handler.archivedAt)
  const { state: businessState } = useBusinessSession()
  const premises = businessState.profile?.premises
  const [step, setStep] = useState<Step>(
    state.application?.stage === "review"
      ? "review"
      : state.application?.handlerIds.length
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank")
  const [checkingPayment, setCheckingPayment] = useState(false)
  const paymentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (paymentTimer.current) clearTimeout(paymentTimer.current)
    },
    []
  )
  const facility = findApprovedFitnessFacility(facilityId)
  const selectedHandlers = currentHandlers.filter((handler) =>
    selectedIds.includes(handler.id)
  )
  const totalNgn = facility
    ? facility.priceNgn * selectedHandlers.length
    : (state.application?.totalNgn ?? 0)
  const titles: Record<Step, string> = {
    people:
      state.application?.purpose === "new-staff"
        ? "Select new food handlers"
        : "Select food handlers",
    facility: "Choose an approved facility",
    review: "Review your application",
    payment: "Payment options",
  }
  const steps: Step[] = ["people", "facility", "review", "payment"]
  const stepLabels: Record<Step, string> = {
    people: "Select food handlers",
    facility: "Choose approved facility",
    review: "Review application",
    payment: "Payment & submission",
  }
  const activeIndex = steps.indexOf(step)
  function go(next: Step) {
    if (checkingPayment) return
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
  function proceedToPayment() {
    const result = chooseFacility(facilityId)
    if (!result.ok) return setError(result.error)
    go("payment")
  }
  function pay() {
    if (checkingPayment) return
    setError("")
    setCheckingPayment(true)
    paymentTimer.current = setTimeout(() => {
      paymentTimer.current = null
      const result = confirmDemoPayment()
      setCheckingPayment(false)
      if (!result.ok) return setError(result.error)
      onPaid?.()
    }, 6000)
  }
  return (
    <div className="fitness-flow min-h-screen bg-[#f7f9f8] text-foreground lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_22rem] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="fitness-form-scroll min-w-0 px-4 pt-5 pb-12 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-12 lg:pt-8">
        <FitnessLink href="/business/applications" variant="outline">
          <ArrowLeft aria-hidden="true" /> Back to applications
        </FitnessLink>
        <div className="mx-auto mt-10 max-w-[43rem] lg:mt-[clamp(4rem,10vh,8rem)]">
          <p className="mb-3 text-xs font-semibold tracking-[0.17em] text-primary uppercase">
            Fitness certificate · Application
          </p>
          <div
            key={step}
            className="fitness-step-panel rounded-2xl border border-border/80 bg-background p-5 shadow-[0_16px_45px_-38px_rgba(10,42,38,.35)] sm:p-8"
          >
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
                {titles[step]}
              </h1>
              {step === "people" && (
                <p
                  role="status"
                  className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <UsersRound className="size-4" aria-hidden="true" />
                  {selectedIds.length} of {currentHandlers.length} selected
                </p>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {step === "people" && (
              <>
                {currentHandlers.length === 0 ? (
                  <FitnessEmptyState
                    title={
                      state.application?.purpose === "new-staff"
                        ? "No new food handlers available"
                        : "Add food handlers first"
                    }
                    description="Save staff records with identity, job role, phone, and consent before applying."
                    href="/business/food-handlers"
                    label="Manage food handlers"
                  />
                ) : (
                  <>
                    <div className="overflow-hidden rounded-xl border border-border/80">
                      <table className="w-full text-left text-sm">
                        <caption className="sr-only">
                          Food handlers at {premises?.premisesName}
                        </caption>
                        <thead className="bg-muted/45 text-xs font-semibold text-muted-foreground">
                          <tr>
                            <th scope="col" className="w-11 px-4 py-3">
                              <span className="sr-only">Select</span>
                            </th>
                            <th scope="col" className="px-2 py-3">
                              Food handler
                            </th>
                            <th
                              scope="col"
                              className="hidden px-3 py-3 sm:table-cell"
                            >
                              Role
                            </th>
                            <th
                              scope="col"
                              className="w-[42%] px-3 py-3 sm:w-[38%]"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentHandlers.map((handler) => {
                            const readiness = handlerReadiness(handler)
                            return (
                              <tr
                                key={handler.id}
                                className="border-t border-border/70 align-top"
                              >
                                <td className="px-4 py-4">
                                  <Checkbox
                                    id={`select-${handler.id}`}
                                    aria-label={`Select ${handler.fullName}`}
                                    disabled={!readiness.ready}
                                    checked={selectedIds.includes(handler.id)}
                                    onCheckedChange={(checked) => {
                                      setError("")
                                      setSelectedIds((ids) =>
                                        checked
                                          ? [...ids, handler.id]
                                          : ids.filter(
                                              (id) => id !== handler.id
                                            )
                                      )
                                    }}
                                    aria-describedby={`readiness-${handler.id}`}
                                  />
                                </td>
                                <td className="px-2 py-3.5">
                                  <label
                                    htmlFor={`select-${handler.id}`}
                                    className="leading-5 font-medium"
                                  >
                                    {handler.fullName}
                                  </label>
                                  <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
                                    {handler.role || "Role needed"}
                                  </span>
                                </td>
                                <td className="hidden px-3 py-3.5 text-muted-foreground sm:table-cell">
                                  {handler.role || "Role needed"}
                                </td>
                                <td
                                  id={`readiness-${handler.id}`}
                                  className="px-3 py-3.5"
                                >
                                  <span
                                    className={`inline-flex items-center gap-1.5 font-medium ${readiness.ready ? "text-primary" : "text-amber-800"}`}
                                  >
                                    {readiness.ready ? (
                                      <CheckCircle2
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      <CircleAlert
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                      />
                                    )}
                                    {readiness.ready ? "Ready" : "Needs update"}
                                  </span>
                                  {!readiness.ready && (
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                      {readiness.reasons.join(" · ")}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                      <FitnessLink
                        href="/business/food-handlers"
                        variant="link"
                      >
                        Manage food handlers
                      </FitnessLink>
                      <Button
                        className="fitness-action min-h-11 px-5"
                        onClick={continuePeople}
                        disabled={selectedIds.length === 0}
                      >
                        Next{" "}
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
            {step === "facility" && (
              <>
                <p className="mb-5 text-sm leading-6 text-muted-foreground">
                  Select from the list of approved facilities to perform the
                  fitness assessment.
                </p>
                <FieldSet>
                  <FieldLegend className="sr-only">
                    Facility choices
                  </FieldLegend>
                  <FieldGroup className="gap-3">
                    {APPROVED_FITNESS_FACILITIES.map((option) => (
                      <Field
                        key={option.id}
                        orientation="horizontal"
                        className={`cursor-pointer items-start rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring/50 hover:bg-muted/30 sm:p-5 ${facilityId === option.id ? "border-primary/50 bg-primary/5" : "border-border"}`}
                        onClick={(event) => {
                          if (
                            (event.target as HTMLElement).closest("button, a")
                          )
                            return
                          setFacilityId(option.id)
                          setError("")
                        }}
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
                        <FieldContent className="min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                            <FieldLabel
                              htmlFor={option.id}
                              className="min-h-6 text-base font-semibold"
                            >
                              {option.name}
                            </FieldLabel>
                            <div className="text-left sm:text-right">
                              <p className="text-xl font-semibold tracking-tight text-[#D35E24]">
                                {formatFitnessPrice(
                                  option.priceNgn * selectedHandlers.length
                                )}
                              </p>
                            </div>
                          </div>
                          <div
                            id={`${option.id}-details`}
                            className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground"
                          >
                            <p className="flex items-start gap-2">
                              <MapPin
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                              />
                              {option.location}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <Phone
                                className="size-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{option.contact}</span>
                              <CopyValueButton
                                value={option.contact}
                                label={`${option.name} phone number`}
                              />
                            </div>
                            <p className="text-xs">
                              {formatFitnessPrice(option.priceNgn)} ×{" "}
                              {selectedHandlers.length}{" "}
                              {selectedHandlers.length === 1
                                ? "food handler"
                                : "food handlers"}
                            </p>
                          </div>
                        </FieldContent>
                      </Field>
                    ))}
                  </FieldGroup>
                </FieldSet>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => go("people")}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={review}
                    disabled={!facilityId}
                  >
                    Next{" "}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </div>
              </>
            )}
            {step === "review" && (
              <>
                <section aria-labelledby="fitness-summary-heading">
                  <h2
                    id="fitness-summary-heading"
                    className="text-base font-semibold"
                  >
                    Application summary
                  </h2>
                  <dl className="mt-5 divide-y divide-border/70 border-t border-border/70">
                    <div className="py-4">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="size-4" aria-hidden="true" />
                        Premises
                      </dt>
                      <dd className="mt-1.5 font-medium">
                        {premises?.premisesName}
                      </dd>
                      <dd className="text-sm text-muted-foreground">
                        {premises?.address}
                      </dd>
                    </div>
                    <div className="py-4">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4" aria-hidden="true" />
                        Facility
                      </dt>
                      <dd className="mt-1.5 font-medium">{facility?.name}</dd>
                      <dd className="text-sm text-muted-foreground">
                        {facility?.location}
                      </dd>
                    </div>
                    <div className="py-4">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardCheck className="size-4" aria-hidden="true" />
                        Service
                      </dt>
                      <dd className="mt-1.5 font-medium">
                        {facility?.service}
                      </dd>
                    </div>
                    <div className="py-4">
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UsersRound className="size-4" aria-hidden="true" />
                        Food handlers · {selectedHandlers.length}
                      </dt>
                      <dd className="mt-2">
                        <ol className="list-decimal space-y-2 pl-5 marker:text-muted-foreground">
                          {selectedHandlers.map((handler) => (
                            <li key={handler.id} className="pl-1">
                              <span className="font-medium">
                                {handler.fullName}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {" · "}
                                {handler.role}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-semibold tracking-tight text-[#D35E24]">
                      {formatFitnessPrice(totalNgn)}
                    </span>
                  </div>
                </section>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => go("facility")}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={proceedToPayment}
                  >
                    Next{" "}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </div>
              </>
            )}
            {step === "payment" && (
              <>
                <p className="mb-6 text-sm text-muted-foreground">
                  Choose how to pay {formatFitnessPrice(totalNgn)} for{" "}
                  {selectedHandlers.length}{" "}
                  {selectedHandlers.length === 1
                    ? "food handler"
                    : "food handlers"}
                  .
                </p>
                <FieldSet disabled={checkingPayment}>
                  <FieldLegend className="sr-only">Payment method</FieldLegend>
                  <FieldGroup className="gap-3">
                    <div
                      className={`rounded-xl border ${paymentMethod === "bank" ? "border-primary/50" : "border-border"}`}
                    >
                      <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 font-medium">
                        <input
                          type="radio"
                          name="fitness-payment"
                          value="bank"
                          checked={paymentMethod === "bank"}
                          onChange={() => setPaymentMethod("bank")}
                          className="size-4 accent-primary"
                        />
                        <Landmark
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        Bank transfer
                      </label>
                      {paymentMethod === "bank" && (
                        <div
                          data-testid="bank-transfer-details"
                          className="mx-3 mb-3 rounded-lg bg-[#EEF7FC] p-4 sm:mx-4 sm:p-5"
                        >
                          <dl className="grid gap-4 sm:grid-cols-2">
                            <PaymentDetail
                              label="Bank name"
                              value={PAYMENT_BANK.name}
                              copy
                            />
                            <PaymentDetail
                              label="Account number"
                              value={PAYMENT_BANK.accountNumber}
                              copy
                            />
                            <PaymentDetail
                              label="Account name"
                              value={PAYMENT_BANK.accountName}
                            />
                            <PaymentDetail
                              label="Amount to pay"
                              value={formatFitnessPrice(totalNgn)}
                              highlight
                            />
                          </dl>
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-xl border ${paymentMethod === "paystack" ? "border-primary/50" : "border-border"}`}
                    >
                      <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 font-medium">
                        <input
                          type="radio"
                          name="fitness-payment"
                          value="paystack"
                          checked={paymentMethod === "paystack"}
                          onChange={() => setPaymentMethod("paystack")}
                          className="size-4 accent-primary"
                        />
                        <Wallet
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        Paystack
                      </label>
                      {paymentMethod === "paystack" && (
                        <div className="mx-4 mb-4 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                          <p>Paystack supports card and bank payments.</p>
                          <p className="mt-1">
                            Amount: {formatFitnessPrice(totalNgn)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-xl border ${paymentMethod === "card" ? "border-primary/50" : "border-border"}`}
                    >
                      <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 font-medium">
                        <input
                          type="radio"
                          name="fitness-payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="size-4 accent-primary"
                        />
                        <CreditCard
                          className="size-4 text-primary"
                          aria-hidden="true"
                        />
                        Card payment
                      </label>
                      {paymentMethod === "card" && (
                        <div className="mx-4 mb-4 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                          <p>Pay with a debit or credit card.</p>
                          <p className="mt-1">
                            Amount: {formatFitnessPrice(totalNgn)}
                          </p>
                        </div>
                      )}
                    </div>
                  </FieldGroup>
                </FieldSet>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => go("review")}
                    disabled={checkingPayment}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={pay}
                    disabled={checkingPayment}
                  >
                    {checkingPayment && (
                      <Spinner data-icon="inline-start" aria-hidden="true" />
                    )}
                    {checkingPayment
                      ? "Checking payment…"
                      : "I have made payment"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <aside
        className="flex flex-col border-t border-border/80 bg-background px-5 py-7 sm:px-8 lg:h-dvh lg:overflow-hidden lg:border-t-0 lg:border-l lg:px-6 lg:py-10"
        aria-label="Application progress"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Application guide
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeIndex} of {steps.length} completed
          </p>
        </div>
        <ol aria-label="Application steps" className="mt-8 space-y-2">
          {steps.map((item, index) => (
            <li
              key={item}
              aria-current={item === step ? "step" : undefined}
              className={`fitness-progress-item flex min-h-16 items-center gap-3 rounded-xl px-3 py-2 transition-[background-color,color] duration-200 ${item === step ? "bg-primary/7 text-foreground" : "text-muted-foreground"}`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200 ${index < activeIndex ? "border-primary bg-primary text-primary-foreground" : item === step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
              >
                {index < activeIndex ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-sm font-medium">{stepLabels[item]}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-xl border border-border/80 bg-[#f7f9f8] p-4 lg:mt-auto">
          <p className="flex items-center gap-2 font-semibold">
            <CircleHelp className="size-4 text-primary" aria-hidden="true" />
            What happens next?
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            After payment, contact your selected facility to coordinate the
            assessment. The council reviews the facility result before issuing a
            certificate.
          </p>
        </div>
      </aside>
    </div>
  )
}

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    []
  )

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value)
      setCopyFailed(false)
      setCopied(true)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => {
        setCopied(false)
        resetTimer.current = null
      }, 3000)
    } catch {
      setCopyFailed(true)
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => void copyValue()}
        aria-label={`${copied ? "Copied" : "Copy"} ${label}`}
        title={`${copied ? "Copied" : "Copy"} ${label}`}
      >
        <span className="relative size-4">
          <Copy
            aria-hidden="true"
            className={`fitness-copy-icon absolute inset-0 transition-[opacity,transform] duration-200 ${copied ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
          />
          <Check
            aria-hidden="true"
            className={`fitness-copy-icon absolute inset-0 transition-[opacity,transform] duration-200 ${copied ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
          />
        </span>
      </Button>
      {copyFailed && (
        <span role="alert" className="text-xs text-destructive">
          Could not copy
        </span>
      )}
    </span>
  )
}

function PaymentDetail({
  label,
  value,
  copy = false,
  highlight = false,
}: {
  label: string
  value: string
  copy?: boolean
  highlight?: boolean
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-600">{label}</dt>
      <dd
        className={`mt-1 flex flex-wrap items-center gap-1 font-semibold break-all ${highlight ? "text-lg text-[#D35E24]" : "text-foreground"}`}
      >
        {value}
        {copy && <CopyValueButton value={value} label={label.toLowerCase()} />}
      </dd>
    </div>
  )
}

function FitnessSubmissionSuccess() {
  const [open, setOpen] = useState(true)
  const successMessage =
    "Payment confirmed. Application submitted. Track it on the Applications page."
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-4 py-12">
      <div className="max-w-md text-center">
        <CheckCircle2
          aria-hidden="true"
          className="mx-auto size-10 text-primary"
        />
        <h1 className="mt-5 text-2xl font-semibold">Application submitted</h1>
        <p className="mt-2 text-muted-foreground">{successMessage}</p>
        <div className="mt-6">
          <FitnessLink href="/business/fitness/tracker">
            View application
          </FitnessLink>
        </div>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fitness-success-backdrop fixed inset-0 z-50 bg-[#112724]/35" />
          <Dialog.Popup className="fitness-success-dialog fixed top-1/2 left-1/2 z-50 w-[min(27rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-7 text-center shadow-2xl sm:p-9">
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
            <Dialog.Title className="mt-5 text-2xl font-semibold tracking-tight">
              Application submitted
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
              {successMessage}
            </Dialog.Description>
            <FitnessLink href="/business/fitness/tracker">
              View application <ArrowRight aria-hidden="true" />
            </FitnessLink>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export function BusinessApplicationsPage() {
  const { state, isHydrated, startNewStaffApplication } = useFitness()
  const [newStaffError, setNewStaffError] = useState("")
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
  const uncoveredStaff = newStaffHandlers(state)
  const readyNewStaff = uncoveredStaff.some(
    (handler) => handlerReadiness(handler).ready
  )
  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-6 break-words">
      <PageHeader
        eyebrow="Business portal"
        title="Applications"
        description="Prepare and track your certificate applications."
      />
      {newStaffError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{newStaffError}</AlertDescription>
        </Alert>
      )}
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
        <CardFooter className="flex-wrap gap-3">
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
          {application?.stage === "issued" &&
            (readyNewStaff ? (
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setNewStaffError("")
                  const result = startNewStaffApplication()
                  if (!result.ok) return setNewStaffError(result.error)
                  globalThis.location.assign("/business/fitness/apply")
                }}
              >
                Apply for new staff
              </Button>
            ) : (
              <FitnessLink href="/business/food-handlers" variant="outline">
                {uncoveredStaff.length
                  ? "Complete new staff records"
                  : "Add new food handler"}
              </FitnessLink>
            ))}
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
