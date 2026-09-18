import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { useBusinessSession } from "@/app/business-session"
import { VerificationForm } from "@/components/business/verification-form"
import { OnboardingShell } from "@/components/business/onboarding-shell"
import { createBusinessRepository } from "@/services/business-repository"
import type { BusinessRepositoryResult } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

export const Route = createFileRoute("/business/verify")({
  component: BusinessVerify,
})

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@")
  if (!localPart || !domain) return "your registered email"
  return `${localPart.slice(0, 1)}***@${domain}`
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return "your registered phone number"
  return `••••••${digits.slice(-4)}`
}

function maskDestination(email: string, phone: string) {
  return email ? maskEmail(email) : maskPhone(phone)
}

function errorMessage(result: BusinessRepositoryResult) {
  if (result.ok) return undefined
  return (
    Object.values(result.errors).find(
      (message): message is string => typeof message === "string"
    ) ?? "Unable to update your verification. Please try again."
  )
}

export function BusinessVerify() {
  const session = useBusinessSession()
  const profile = session.state.profile
  const completionInProgress = useRef(false)
  const canVerify =
    session.isHydrated &&
    profile !== null &&
    session.state.stage === "verification"

  useEffect(() => {
    if (!session.isHydrated) return
    if (!canVerify && !completionInProgress.current) {
      globalThis.location.assign("/business/register")
    }
  }, [canVerify, session.isHydrated])

  if (!session.isHydrated || !canVerify) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground" role="status">
          Loading your registration…
        </p>
      </main>
    )
  }

  return (
    <OnboardingShell
      title="Verify your contact"
      description="Enter the code we sent to confirm your registration details."
      step={2}
    >
      <VerificationForm
        maskedDestination={maskDestination(profile.email, profile.phone)}
        onVerify={async (code) => {
          const result = createBusinessRepository(
            createBusinessStorage()
          ).verifyContact(code)
          const error = errorMessage(result)
          if (error) return { error }
          completionInProgress.current = true
          await session.refresh()
          globalThis.location.assign("/business/setup")
        }}
        onResend={() => undefined}
        onChangeContact={() => globalThis.location.assign("/business/register")}
      />
    </OnboardingShell>
  )
}
