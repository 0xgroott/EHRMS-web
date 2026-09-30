import { createFileRoute, Link } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { OnboardingShell } from "@/components/business/onboarding-shell"
import { SignInForm } from "@/components/business/sign-in-form"
import { SavedRegistration } from "@/components/business/saved-registration"
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
      <Link
        to="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Choose another account type
      </Link>
      <SavedRegistration />
      <SignInForm
        onSubmit={({ contact, password }) => {
          const result = session.signInDemo(contact, password)
          if (!result.ok)
            return {
              error:
                Object.values(result.errors).find(Boolean) ??
                "Unable to sign in. Please try again.",
            }
          window.location.assign(
            result.state.profile?.verified
              ? "/business/dashboard"
              : result.state.stage === "verification"
                ? "/business/verify"
                : "/business/register"
          )
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
