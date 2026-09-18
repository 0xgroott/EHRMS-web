import { createFileRoute, Link } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { AccountForm } from "@/components/business/account-form"
import { SavedRegistration } from "@/components/business/saved-registration"
import { OnboardingShell } from "@/components/business/onboarding-shell"
import { Button } from "@/components/ui/button"
import { createBusinessRepository } from "@/services/business-repository"
import { createBusinessStorage } from "@/services/business-storage"

export const Route = createFileRoute("/business/register")({
  component: BusinessRegister,
})

function BusinessRegister() {
  const session = useBusinessSession()
  return (
    <OnboardingShell
      title="Create your business account"
      description="Start with your business and contact details. All fields are required."
      step={1}
    >
      <SavedRegistration />
      <AccountForm
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
          // This destination is supplied by the verification slice.
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
