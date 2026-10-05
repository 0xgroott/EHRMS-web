import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useBusinessSession } from "@/app/business-session"

export function BusinessPortalAccess({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { state, isHydrated, signedOut } = useBusinessSession()
  const redirecting = useRef(false)
  const destination = !state.profile
    ? signedOut
      ? "/"
      : "/business/sign-in"
    : state.stage === "account"
      ? "/business/register"
      : !state.profile.verified || state.stage === "verification"
        ? "/business/verify"
        : null
  useEffect(() => {
    if (!isHydrated || !destination || redirecting.current) return
    redirecting.current = true
    void navigate({ to: destination, replace: true })
  }, [destination, isHydrated, navigate])
  if (!isHydrated || destination)
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <p role="status" className="text-sm text-muted-foreground">
          Loading your business portal…
        </p>
      </main>
    )
  return children
}
