import { Link } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { useBusinessSession } from "@/app/business-session"
import { AccountForm } from "@/components/business/account-form"
import { BusinessIdentityForm } from "@/components/business/business-identity-form"
import { FreshRegistrationAccess } from "@/components/business/fresh-registration-access"
import {
  BUSINESS_REGISTRATION_STEPS,
  OnboardingShell,
  VERIFIED_BUSINESS_ONBOARDING_STEPS,
} from "@/components/business/onboarding-shell"
import { SavedRegistration } from "@/components/business/saved-registration"
import { notifySuccessAfterNavigation } from "@/components/ui/app-toast"
import { Button } from "@/components/ui/button"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

export function BusinessRegister() {
  const session = useBusinessSession()
  const [accountStep, setAccountStep] = useState<1 | 2>(1)
  const identityCompletionInProgress = useRef(false)
  const isFreshIdentity =
    identityCompletionInProgress.current ||
    (session.state.stage === "account" && session.state.profile !== null)

  if (!session.isHydrated) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground" role="status">
          Loading business registration…
        </p>
      </main>
    )
  }

  if (isFreshIdentity) {
    return (
      <OnboardingShell
        title="Tell us who is registering"
        description="Add the business name and your full name. We will use these details throughout the registration."
        step={1}
        steps={VERIFIED_BUSINESS_ONBOARDING_STEPS}
      >
        <BusinessIdentityForm
          onSubmit={async (input) => {
            const result = createBusinessRepository(
              createBusinessStorage()
            ).saveBusinessIdentity(input)
            if (!result.ok)
              return {
                fieldErrors: result.errors,
                error:
                  result.errors.state ??
                  "Unable to save your details. Please try again.",
              }
            identityCompletionInProgress.current = true
            await session.refresh()
            globalThis.location.assign("/business/dashboard")
          }}
        />
      </OnboardingShell>
    )
  }

  return (
    <OnboardingShell
      title="Create your business account"
      description="Set up your business account in three short steps."
      step={accountStep}
      steps={BUSINESS_REGISTRATION_STEPS}
    >
      <SavedRegistration />
      <AccountForm
        onPageChange={setAccountStep}
        firstStepContent={
          <FreshRegistrationAccess
            signInLink={
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link to="/business/sign-in" />}
                className="min-h-11"
              >
                Go to sign in
              </Button>
            }
          />
        }
        onSubmit={async (input) => {
          const result = createBusinessRepository(
            createBusinessStorage()
          ).createAccount(input)
          if (!result.ok)
            return {
              fieldErrors: result.errors,
              error:
                Object.values(result.errors).find(Boolean) ??
                "Unable to create your account. Please try again.",
            }
          await session.refresh()
          notifySuccessAfterNavigation("Business account created")
          window.location.assign("/business/verify")
        }}
        signInLink={
          <Button
            variant="link"
            nativeButton={false}
            render={<Link to="/business/sign-in" />}
            className="min-h-11"
          >
            Sign in
          </Button>
        }
      />
    </OnboardingShell>
  )
}
