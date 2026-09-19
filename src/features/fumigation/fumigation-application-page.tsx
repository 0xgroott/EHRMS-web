import { useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
const steps: { id: Step; label: string }[] = [
  { id: "premises", label: "Premises" },
  { id: "provider", label: "Provider" },
  { id: "review", label: "Review" },
  { id: "payment", label: "Payment" },
]

export function FumigationApplicationPage({ onPaid }: { onPaid?: () => void }) {
  const {
    state,
    isHydrated,
    startApplication,
    chooseProvider,
    confirmPayment,
  } = useFumigation()
  const { state: businessState } = useBusinessSession()
  const premises = businessState.profile?.premises
  const application = state.application
  const [step, setStep] = useState<Step>(
    application?.stage === "review"
      ? "review"
      : application
        ? "provider"
        : "premises"
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
    return (
      <div className="max-w-3xl space-y-5">
        <PageHeader
          eyebrow="Fumigation Certificate"
          title="Application underway"
          description="Follow the service report and decision for your premises."
        />
        <FumigationLink href="/business/fumigation/tracker">
          Track application
        </FumigationLink>
      </div>
    )
  }

  const provider = findLicensedProvider(selectedProviderId)
  function go(next: Step) {
    setError("")
    setStep(next)
  }
  function start() {
    const result = startApplication(requestedPeriod, declaration)
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
    onPaid?.()
  }

  return (
    <div className="flex max-w-5xl min-w-0 flex-col gap-7 pb-12">
      <PageHeader
        eyebrow="Fumigation Certificate"
        title={
          {
            premises: "Start fumigation application",
            provider: "Choose a licensed provider",
            review: "Review your application",
            payment: "Service payment",
          }[step]
        }
        description="Arrange fumigation for your registered premises."
      />
      <ol
        aria-label="Application steps"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {steps.map(({ id, label }, index) => (
          <li
            key={id}
            aria-current={step === id ? "step" : undefined}
            className={`border-t-2 pt-2 text-sm ${step === id ? "border-primary font-semibold text-foreground" : "border-border text-muted-foreground"}`}
          >
            <span className="mr-2 tabular-nums">0{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "premises" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="space-y-6">
            <section className="border-b pb-6">
              <h2 className="text-lg font-semibold">Premises</h2>
              <p className="mt-3 font-medium">{premises?.premisesName}</p>
              <p className="text-sm text-muted-foreground">
                {premises?.address}
              </p>
              <p className="text-sm text-muted-foreground">
                {premises?.businessType}
              </p>
            </section>
            <div className="max-w-sm space-y-2">
              <Label htmlFor="requested-period">Requested service month</Label>
              <Input
                id="requested-period"
                type="month"
                value={requestedPeriod}
                onChange={(event) => {
                  setRequestedPeriod(event.target.value)
                  setError("")
                }}
              />
              <p className="text-sm text-muted-foreground">
                The provider will confirm the service date after payment.
              </p>
            </div>
            <div className="flex items-start gap-3">
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
                className="leading-6 font-normal"
              >
                I confirm these premises details are correct and the provider
                may contact me about this service.
              </Label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={start}>Choose provider</Button>
              <FumigationLink href="/business/dashboard" variant="link">
                Cancel
              </FumigationLink>
            </div>
          </div>
          <aside className="border-t pt-4 text-sm text-muted-foreground lg:border-t-0 lg:border-l lg:pl-6">
            <h2 className="font-semibold text-foreground">What happens next</h2>
            <p className="mt-2 leading-6">
              Choose a licensed provider, review the service total, then track
              the report and decision in one place.
            </p>
          </aside>
        </div>
      )}

      {step === "provider" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Select one provider for {premises?.premisesName}. Prices below are
            the full service total.
          </p>
          <fieldset className="space-y-3">
            <legend className="sr-only">Licensed providers</legend>
            {LICENSED_FUMIGATION_PROVIDERS.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer flex-col gap-4 rounded-lg border p-5 transition-colors hover:border-primary sm:flex-row sm:items-start sm:justify-between ${selectedProviderId === option.id ? "border-primary bg-accent/40" : ""}`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <input
                    type="radio"
                    name="fumigation-provider"
                    value={option.id}
                    checked={selectedProviderId === option.id}
                    onChange={() => {
                      setSelectedProviderId(option.id)
                      setError("")
                    }}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold">{option.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Licence {option.registrationNumber} · {option.location}
                    </span>
                    <span className="mt-2 block text-sm">{option.service}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Contact: {option.contact}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatNgn(option.priceNgn)}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <Button onClick={selectProvider}>Select provider</Button>
            <Button variant="outline" onClick={() => go("premises")}>
              Go back
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Service summary</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Premises</dt>
                  <dd className="mt-1 font-medium">{premises?.premisesName}</dd>
                  <dd className="text-sm">{premises?.address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Requested month
                  </dt>
                  <dd className="mt-1 font-medium">{requestedPeriod}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Licensed provider
                  </dt>
                  <dd className="mt-1 font-medium">{provider?.name}</dd>
                  <dd className="text-sm">{provider?.registrationNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Service</dt>
                  <dd className="mt-1 font-medium">{provider?.service}</dd>
                </div>
              </dl>
              <div className="mt-6 flex items-center justify-between border-t pt-5">
                <span className="font-medium">Total price</span>
                <strong className="text-xl tabular-nums">
                  {formatNgn(application?.totalNgn ?? provider?.priceNgn ?? 0)}
                </strong>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => go("payment")}>Proceed to payment</Button>
            <Button variant="outline" onClick={() => go("provider")}>
              Change provider
            </Button>
            <Button variant="link" onClick={() => go("premises")}>
              Edit application
            </Button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>
                  <h2>Payment summary</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>{provider?.service}</p>
                <p className="text-sm text-muted-foreground">
                  {provider?.name} · {premises?.premisesName}
                </p>
                <div className="flex items-center justify-between border-t pt-4">
                  <span>Total</span>
                  <strong className="text-xl tabular-nums">
                    {formatNgn(application?.totalNgn ?? 0)}
                  </strong>
                </div>
              </CardContent>
            </Card>
            <Alert>
              <AlertTitle>Payment simulation</AlertTitle>
              <AlertDescription>
                Confirming this step records a payment in this browser only. No
                money moves and no provider is booked. The provider, EHO, and
                council steps are also simulated separately.
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-3">
              <Button onClick={pay}>Confirm payment</Button>
              <Button variant="outline" onClick={() => go("review")}>
                Return to application
              </Button>
              <FumigationLink href="/business/dashboard" variant="link">
                Pay later
              </FumigationLink>
            </div>
          </div>
          <aside className="border-t pt-4 text-sm text-muted-foreground lg:border-t-0 lg:border-l lg:pl-6">
            <Badge variant="outline">Next</Badge>
            <p className="mt-3 leading-6">
              After confirmation, the application tracker shows the provider
              report, EHO confirmation, and council decision.
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
