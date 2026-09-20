import { useEffect, useRef, useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { VerificationForm } from "@/components/business/verification-form"
import { ContactForm } from "@/components/business/contact-form"
import { OnboardingShell } from "@/components/business/onboarding-shell"
import {
  notifySuccess,
  notifySuccessAfterNavigation,
} from "@/components/ui/app-toast"
import { createBusinessRepository } from "@/services/business-repository"
import type { BusinessRepositoryResult } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

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
  return [email ? maskEmail(email) : "", phone ? maskPhone(phone) : ""]
    .filter(Boolean)
    .join(" or ")
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
  const [editingContact, setEditingContact] = useState(false)
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
      title={
        editingContact ? "Change your contact details" : "Verify your contact"
      }
      description={
        editingContact
          ? "Update your email or phone number. Your business details stay saved."
          : "Enter the code we sent to confirm your registration details."
      }
      step={2}
    >
      {editingContact ? (
        <ContactForm
          contact={{ email: profile.email, phone: profile.phone }}
          onCancel={() => setEditingContact(false)}
          onSubmit={async (input) => {
            const result = createBusinessRepository(
              createBusinessStorage()
            ).updateContact(input)
            if (!result.ok)
              return { fieldErrors: result.errors, error: result.errors.state }
            await session.refresh()
            setEditingContact(false)
            notifySuccess("Contact details updated")
          }}
        />
      ) : (
        <VerificationForm
          maskedDestination={maskDestination(profile.email, profile.phone)}
          expiresAt={session.state.verificationExpiresAt ?? 0}
          onVerify={async (code) => {
            const result = createBusinessRepository(
              createBusinessStorage()
            ).verifyContact(code)
            const error = errorMessage(result)
            if (error) return { error }
            completionInProgress.current = true
            await session.refresh()
            notifySuccessAfterNavigation("Contact verified")
            globalThis.location.assign("/business/setup")
          }}
          onResend={async () => {
            const result = createBusinessRepository(
              createBusinessStorage()
            ).resendVerification()
            if (!result.ok) return { error: errorMessage(result) }
            await session.refresh()
            notifySuccess("Verification code resent")
            return { expiresAt: result.state.verificationExpiresAt }
          }}
          onChangeContact={() => setEditingContact(true)}
        />
      )}
    </OnboardingShell>
  )
}
