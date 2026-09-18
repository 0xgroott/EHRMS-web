import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { useBusinessSession } from "@/app/business-session"
import { BusinessSetupForm } from "@/components/business/business-setup-form"
import { OnboardingShell } from "@/components/business/onboarding-shell"
import type { BusinessPremisesInput } from "@/domain/business-types"
import { createBusinessRepository } from "@/services/business-repository"
import type { BusinessRepositoryResult } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

export const Route = createFileRoute("/business/setup")({
  component: BusinessSetup,
})

const emptyPremises: BusinessPremisesInput = {
  premisesName: "",
  businessType: "",
  registrationNumber: "",
  address: "",
  ward: "",
  councilId: "",
}

function resultError(result: BusinessRepositoryResult) {
  if (result.ok) return undefined
  return (
    Object.values(result.errors).find(
      (message): message is string => typeof message === "string"
    ) ?? "Unable to update your business setup. Please try again."
  )
}

export function BusinessSetup() {
  const session = useBusinessSession()
  const profile = session.state.profile
  const redirecting = useRef(false)
  const completing = useRef(false)
  useEffect(() => {
    if (!session.isHydrated || redirecting.current) return
    if (!profile) {
      redirecting.current = true
      globalThis.location.assign("/business/register")
      return
    }
    if (!profile.verified || session.state.stage === "verification") {
      redirecting.current = true
      globalThis.location.assign("/business/verify")
      return
    }
    if (session.state.stage === "complete") {
      redirecting.current = true
      globalThis.location.assign("/business/dashboard")
    }
  }, [profile, session.isHydrated, session.state.stage])

  if (
    !session.isHydrated ||
    profile === null ||
    !profile.verified ||
    session.state.stage !== "setup"
  ) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground" role="status">
          Loading your business setup…
        </p>
      </main>
    )
  }

  const initialValues: BusinessPremisesInput = {
    ...emptyPremises,
    premisesName: profile.premises?.premisesName ?? profile.businessName,
    businessType: profile.premises?.businessType ?? "",
    registrationNumber: profile.premises?.registrationNumber ?? "",
    address: profile.premises?.address ?? "",
    ward: profile.premises?.ward ?? "",
    councilId: profile.premises?.councilId ?? "",
  }

  return (
    <OnboardingShell
      title="Tell us about your business"
      description="Add the details for your business and its first premises. You can save a draft and return later."
      step={3}
    >
      <BusinessSetupForm
        initialValues={initialValues}
        initialDocuments={profile.documents}
        onSaveDraft={async (premises, documents) => {
          const result = createBusinessRepository(
            createBusinessStorage()
          ).savePremisesDraft(premises, documents)
          const error = resultError(result)
          if (error) return { error }
          await session.refresh()
        }}
        onComplete={async (premises, documents) => {
          if (completing.current) return
          completing.current = true
          const result = createBusinessRepository(
            createBusinessStorage()
          ).completeSetup(premises, documents)
          const error = resultError(result)
          if (error) {
            completing.current = false
            return { error }
          }
          await session.refresh()
          globalThis.location.assign("/business/dashboard")
        }}
        onExit={() => globalThis.location.assign("/business/sign-in")}
      />
    </OnboardingShell>
  )
}
