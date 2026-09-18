import { createFileRoute, Link } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { OnboardingShell } from "@/components/business/onboarding-shell"
import { SignInForm } from "@/components/business/sign-in-form"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/business/sign-in")({
  component: BusinessSignIn,
})

function BusinessSignIn() {
  const session = useBusinessSession()
  return (
    <OnboardingShell
      title="Sign in to your business"
      description="Continue managing your applications, certificates and inspections."
    >
      <SignInForm
        onSubmit={({ contact, password }) => {
          const result = session.signInDemo(contact, password)
          if (!result.ok)
            return {
              error:
                Object.values(result.errors).find(Boolean) ??
                "Unable to sign in. Please try again.",
            }
          // This destination is supplied by the dashboard slice.
          window.location.assign("/business/dashboard")
        }}
        createAccountLink={
          <Button
            variant="link"
            nativeButton={false}
            render={<Link to="/business/register" />}
            className="min-h-11"
          >
            Create account
          </Button>
        }
      />
    </OnboardingShell>
  )
}
