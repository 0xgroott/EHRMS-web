import { useEffect, useId, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export type VerificationActionResult = void | {
  error?: string
  expiresAt?: number
}
export type VerificationAction = (
  value?: string
) => VerificationActionResult | Promise<VerificationActionResult>

export type VerificationFormProps = {
  maskedDestination: string
  expiresAt?: number
  onVerify: (
    code: string
  ) => VerificationActionResult | Promise<VerificationActionResult>
  onResend: () => VerificationActionResult | Promise<VerificationActionResult>
  onChangeContact: () => void
}

const RESEND_SECONDS = 60
const MAX_RESENDS = 3

export function VerificationForm({
  maskedDestination,
  expiresAt,
  onVerify,
  onResend,
  onChangeContact,
}: VerificationFormProps) {
  const id = useId()
  const [code, setCode] = useState("")
  const [resendAvailableAt, setResendAvailableAt] = useState(() =>
    expiresAt !== undefined && expiresAt <= Date.now()
      ? 0
      : Date.now() + RESEND_SECONDS * 1000
  )
  const [resendAttempts, setResendAttempts] = useState(0)
  const [pendingAction, setPendingAction] = useState<"verify" | "resend">()
  const [error, setError] = useState<string>()
  const [feedback, setFeedback] = useState<string>()
  const [expiry, setExpiry] = useState(expiresAt)
  const [now, setNow] = useState(Date.now)
  const seconds = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000))
  const expired = expiry !== undefined && now >= expiry

  useEffect(() => {
    setExpiry(expiresAt)
  }, [expiresAt])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const codeError = code.length > 0 && code.length !== 6
  const resendLimitReached = resendAttempts >= MAX_RESENDS && seconds === 0
  const resendDisabled =
    pendingAction !== undefined || seconds > 0 || resendAttempts >= MAX_RESENDS

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingAction || expired) return
    setError(undefined)
    setFeedback(undefined)
    if (code.length !== 6) {
      setError("Enter a 6-digit verification code")
      return
    }

    setPendingAction("verify")
    try {
      const result = await onVerify(code)
      if (result?.error) setError(result.error)
    } catch {
      setError("Unable to verify your code. Please try again.")
    } finally {
      setPendingAction(undefined)
    }
  }

  async function handleResend() {
    if (resendDisabled) return
    setError(undefined)
    setFeedback(undefined)
    setPendingAction("resend")
    try {
      const result = await onResend()
      if (result?.error) {
        setError(result.error)
        return
      }
      setResendAttempts((current) => current + 1)
      setResendAvailableAt(Date.now() + RESEND_SECONDS * 1000)
      if (result?.expiresAt !== undefined) setExpiry(result.expiresAt)
      setNow(Date.now())
      setCode("")
      setFeedback("A new verification code has been sent.")
    } catch {
      setError("Unable to send a new code. Please try again.")
    } finally {
      setPendingAction(undefined)
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleVerify(event)}
      className="flex flex-col gap-6"
    >
      <p className="text-sm leading-relaxed">
        Enter the 6-digit code sent to <strong>{maskedDestination}</strong>.
      </p>
      <p className="text-sm font-medium text-primary">Use code 123456</p>
      <FieldGroup>
        <Field data-invalid={!!error || codeError}>
          <FieldLabel htmlFor={`${id}-code`}>
            6-digit verification code
          </FieldLabel>
          <Input
            id={`${id}-code`}
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              setError(undefined)
            }}
            aria-invalid={!!error || codeError}
            aria-describedby={`${id}-hint${error || codeError ? ` ${id}-error` : ""}`}
            className="min-h-11 tracking-[0.35em]"
          />
          <FieldDescription id={`${id}-hint`}>
            This code expires five minutes after it is issued.
          </FieldDescription>
          {(error || codeError) && (
            <p
              id={`${id}-error`}
              className="text-sm text-destructive"
              aria-live="polite"
            >
              {error ?? "Enter a 6-digit verification code"}
            </p>
          )}
        </Field>
      </FieldGroup>
      {expired && (
        <Alert variant="destructive">
          <AlertDescription>
            This code has expired. Request a new code.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={pendingAction !== undefined || expired}
        className="min-h-11 w-full"
      >
        {pendingAction === "verify" ? "Verifying…" : "Verify and continue"}
      </Button>
      <div className="flex flex-col items-center gap-2 text-center text-sm">
        {resendLimitReached ? (
          <p className="text-destructive" role="status" aria-live="polite">
            You have reached the maximum of 3 resend attempts.
          </p>
        ) : seconds > 0 ? (
          <p aria-hidden="true">Resend code in {seconds} seconds</p>
        ) : (
          <p role="status" aria-live="polite">
            You can request a new code now.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={resendDisabled}
          className="min-h-11 w-full"
          onClick={() => void handleResend()}
        >
          {pendingAction === "resend" ? "Sending…" : "Resend code"}
        </Button>
        {feedback && seconds > 0 && (
          <p role="status" aria-live="polite" className="sr-only">
            {feedback}
          </p>
        )}
        <Button
          type="button"
          variant="link"
          disabled={pendingAction !== undefined}
          className="min-h-11"
          onClick={() => onChangeContact()}
        >
          Change contact
        </Button>
      </div>
    </form>
  )
}
