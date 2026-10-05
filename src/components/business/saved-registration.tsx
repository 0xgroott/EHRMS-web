import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function SavedRegistration() {
  const navigate = useNavigate()
  const session = useBusinessSession()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  if (
    !session.isHydrated ||
    !session.state.profile ||
    !["verification", "setup"].includes(session.state.stage)
  )
    return null

  async function resume() {
    if (pending) return
    setPending(true)
    setError(undefined)
    const state = await session.refresh()
    if (
      state?.profile &&
      (state.stage === "verification" || state.stage === "setup")
    ) {
      await navigate({
        to:
          state.stage === "setup" ? "/business/dashboard" : "/business/verify",
      })
    } else {
      setError("Unable to resume this registration. Please try again.")
    }
    setPending(false)
  }

  return (
    <section
      aria-label="Saved registration"
      className="mb-6 flex flex-col gap-3 rounded-lg border bg-muted/40 p-4"
    >
      <p className="text-sm font-medium">
        Continue registering {session.state.profile.businessName}
      </p>
      <p className="text-sm text-muted-foreground">
        Your registration is saved in this browser. Continue without a password
        on this device.
      </p>
      <Button
        type="button"
        variant="outline"
        className="min-h-11"
        disabled={pending}
        onClick={() => void resume()}
      >
        {pending
          ? "Opening saved registration…"
          : "Continue saved registration"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </section>
  )
}
