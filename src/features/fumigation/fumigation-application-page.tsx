import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, CircleHelp } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { notifySuccess } from "@/components/ui/app-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BusinessPremisesInput } from "@/domain/business-types"
import { cn } from "@/lib/utils"
import { useFumigation } from "./fumigation-context"
import {
  LICENSED_FUMIGATION_PROVIDERS,
  findLicensedProvider,
} from "./fumigation-seeds"
import {
  FumigationLink,
  FumigationLoading,
  formatNgn,
} from "./fumigation-shared"

type Step = "premises" | "provider" | "review" | "payment"

const steps: Step[] = ["premises", "provider", "review", "payment"]
const stepLabels: Record<Step, string> = {
  premises: "Application details",
  provider: "Choose a licensed provider",
  review: "Review application",
  payment: "Payment & submission",
}
const stepTitles: Record<Step, string> = {
  premises: "Application details",
  provider: "Choose a licensed provider",
  review: "Review application",
  payment: "Payment & submission",
}

export function FumigationApplicationPage({ onPaid }: { onPaid?: () => void }) {
  const {
    state,
    isHydrated,
    startApplication,
    chooseProvider,
    confirmPayment,
  } = useFumigation()
  const { state: businessState } = useBusinessSession()
  const profile = businessState.profile
  const premisesOptions = getPremisesOptions(
    profile?.premises,
    profile?.branches
  )
  const application = state.application
  const [step, setStep] = useState<Step>(
    application?.stage === "review"
      ? "review"
      : application
        ? "provider"
        : "premises"
  )
  const [premisesName, setPremisesName] = useState(
    application?.premisesName ?? premisesOptions.at(0)?.premisesName ?? ""
  )
  const [requestedPeriod, setRequestedPeriod] = useState(
    application?.requestedPeriod ?? ""
  )
  const [declaration, setDeclaration] = useState(
    application?.declaration ?? false
  )
  const [selectedProviderId, setSelectedProviderId] = useState(
    application?.providerId ?? ""
  )
  const [error, setError] = useState("")

  if (!isHydrated) return <FumigationLoading />
  if (application && !["draft", "review"].includes(application.stage)) {
    return <ExistingApplication stage={application.stage} />
  }

  const provider = findLicensedProvider(
    application?.providerId ?? selectedProviderId
  )
  const selectedPremises =
    premisesOptions.find((option) => option.premisesName === premisesName) ??
    premisesOptions.at(0)
  const activeIndex = steps.indexOf(step)

  function go(next: Step) {
    setError("")
    setStep(next)
  }

  function start() {
    const result = startApplication(requestedPeriod, declaration, premisesName)
    if (!result.ok) return setError(result.error)
    go("provider")
  }

  function selectProvider() {
    const result = chooseProvider(selectedProviderId)
    if (!result.ok) return setError(result.error)
    go("review")
  }

  function pay() {
    const result = confirmPayment()
    if (!result.ok) return setError(result.error)
    notifySuccess("Fumigation application submitted")
    onPaid?.()
  }

  return (
    <div className="fitness-flow min-h-screen bg-background text-foreground lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_22rem] lg:overflow-hidden xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="fitness-form-scroll min-w-0 px-4 pt-5 pb-12 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-12 lg:pt-8">
        <FumigationLink href="/business/applications" variant="outline">
          <ArrowLeft aria-hidden="true" /> Back to applications
        </FumigationLink>

        <div className="mx-auto mt-10 max-w-[43rem] lg:mt-[clamp(4rem,10vh,8rem)]">
          <div
            key={step}
            className="fitness-step-panel rounded-2xl border border-border/80 bg-background p-5 shadow-[0_16px_45px_-38px_rgba(10,42,38,.35)] sm:p-8"
          >
            <div className="mb-7">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
                {stepTitles[step]}
              </h1>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "premises" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fumigation-premises">
                    Business branch/location
                  </Label>
                  <Select
                    items={premisesOptions.map((option) => ({
                      value: option.premisesName,
                      label: `${option.premisesName}, ${option.ward}`,
                    }))}
                    value={premisesName}
                    onValueChange={(value) => {
                      setPremisesName(value ?? "")
                      setError("")
                    }}
                    disabled={premisesOptions.length < 2}
                  >
                    <SelectTrigger
                      id="fumigation-premises"
                      className="min-h-11 w-full"
                      aria-required="true"
                    >
                      <SelectValue placeholder="Select branch/location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {premisesOptions.map((option) => (
                          <SelectItem
                            key={`${option.premisesName}-${option.address}`}
                            value={option.premisesName}
                          >
                            {option.premisesName}, {option.ward}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requested-period">
                    Requested service month
                  </Label>
                  <Input
                    id="requested-period"
                    type="month"
                    value={requestedPeriod}
                    onChange={(event) => {
                      setRequestedPeriod(event.target.value)
                      setError("")
                    }}
                    className="min-h-11"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
                  <Checkbox
                    id="fumigation-declaration"
                    checked={declaration}
                    onCheckedChange={(checked) => {
                      setDeclaration(checked === true)
                      setError("")
                    }}
                  />
                  <Label
                    htmlFor="fumigation-declaration"
                    className="leading-5 font-normal"
                  >
                    I confirm the selected premises details are correct.
                  </Label>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={start}
                  >
                    Next{" "}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}

            {step === "provider" && (
              <div className="space-y-5">
                <fieldset className="grid gap-3">
                  <legend className="sr-only">Licensed providers</legend>
                  {LICENSED_FUMIGATION_PROVIDERS.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30 sm:p-5",
                        selectedProviderId === option.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <span className="flex min-w-0 gap-3">
                        <input
                          type="radio"
                          name="fumigation-provider"
                          value={option.id}
                          checked={selectedProviderId === option.id}
                          onChange={() => {
                            setSelectedProviderId(option.id)
                            setError("")
                          }}
                          className="mt-1 size-4 shrink-0 accent-primary"
                        />
                        <span className="min-w-0">
                          <span className="block font-semibold">
                            {option.name}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            {option.registrationNumber} · {option.location}
                          </span>
                        </span>
                      </span>
                      <strong className="shrink-0 text-[var(--text-warning)] tabular-nums">
                        {formatNgn(option.priceNgn)}
                      </strong>
                    </label>
                  ))}
                </fieldset>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => go("premises")}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={selectProvider}
                    disabled={!selectedProviderId}
                  >
                    Next{" "}
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <section aria-labelledby="fumigation-summary-heading">
                  <h2
                    id="fumigation-summary-heading"
                    className="text-base font-semibold"
                  >
                    Application summary
                  </h2>
                  <dl className="mt-5 divide-y divide-border/70 border-t border-border/70">
                    <SummaryItem
                      label="Branch"
                      value={selectedPremises?.premisesName}
                    />
                    <SummaryItem
                      label="Service month"
                      value={requestedPeriod}
                    />
                    <SummaryItem label="Provider" value={provider?.name} />
                    <SummaryItem label="Service" value={provider?.service} />
                  </dl>
                  <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-5">
                    <span className="font-medium">Total</span>
                    <strong className="text-2xl font-semibold tracking-tight text-[var(--text-warning)] tabular-nums">
                      {formatNgn(
                        application?.totalNgn ?? provider?.priceNgn ?? 0
                      )}
                    </strong>
                  </div>
                </section>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => go("provider")}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={() => go("payment")}
                  >
                    Continue to payment
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <dl className="divide-y divide-border/70 border-y border-border/70">
                  <SummaryItem
                    label="Branch"
                    value={application?.premisesName ?? premisesName}
                  />
                  <SummaryItem label="Provider" value={provider?.name} />
                  <SummaryItem label="Service" value={provider?.service} />
                  <SummaryItem
                    label="Total"
                    value={formatNgn(application?.totalNgn ?? 0)}
                  />
                </dl>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => go("review")}
                  >
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <Button
                    className="fitness-action min-h-11 px-5"
                    onClick={pay}
                  >
                    Confirm payment and submit
                  </Button>
                </div>
              </div>
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
              className={cn(
                "fitness-progress-item flex min-h-16 items-center gap-3 rounded-xl px-3 py-2 transition-[background-color,color] duration-200",
                item === step
                  ? "bg-primary/7 text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-[background-color,border-color,color] duration-200",
                  index < activeIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : item === step
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                )}
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
        <div className="mt-10 rounded-xl border border-border/80 bg-background p-4 lg:mt-auto">
          <p className="flex items-center gap-2 font-semibold">
            <CircleHelp className="size-4 text-primary" aria-hidden="true" />
            What happens next?
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            After payment, the selected provider completes the service and
            submits a report for council review.
          </p>
        </div>
      </aside>
    </div>
  )
}

function ExistingApplication({ stage }: { stage: string }) {
  const issued = stage === "issued"
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 lg:p-12">
      <FumigationLink href="/business/applications" variant="outline">
        <ArrowLeft aria-hidden="true" /> Back to applications
      </FumigationLink>
      <div className="mx-auto mt-10 max-w-[43rem] rounded-2xl border bg-background p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">
          {issued ? "Certificate issued" : "Application underway"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {issued
            ? "Your certificate is ready to view."
            : "Track the provider service and council decision."}
        </p>
        <FumigationLink
          className="mt-5"
          href={
            issued
              ? "/business/fumigation/certificate"
              : "/business/fumigation/tracker"
          }
        >
          {issued ? "View certificate" : "View application"}
        </FumigationLink>
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="py-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 font-medium break-words">{value || "—"}</dd>
    </div>
  )
}

function getPremisesOptions(
  primary?: BusinessPremisesInput,
  branches?: BusinessPremisesInput[]
) {
  const options = branches?.length ? branches : primary ? [primary] : []
  return options.filter(
    (option, index) =>
      options.findIndex(
        (candidate) => candidate.premisesName === option.premisesName
      ) === index
  )
}
