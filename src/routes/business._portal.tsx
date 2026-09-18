import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useBusinessSession } from "@/app/business-session"
import { BusinessShell } from "@/components/business/business-shell"

export const Route = createFileRoute("/business/_portal")({
  component: () => (
    <BusinessPortalAccess>
      <BusinessShell />
    </BusinessPortalAccess>
  ),
})

export function BusinessPortalAccess({ children }: { children: ReactNode }) {
  const { state, isHydrated } = useBusinessSession()
  const redirecting = useRef(false)
  const destination = !state.profile
    ? "/business/sign-in"
    : state.stage === "account"
      ? "/business/register"
      : !state.profile.verified || state.stage === "verification"
        ? "/business/verify"
        : state.stage !== "complete" || !state.profile.premises
          ? "/business/setup"
          : null
  useEffect(() => {
    if (!isHydrated || !destination || redirecting.current) return
    redirecting.current = true
    globalThis.location.assign(destination)
  }, [destination, isHydrated])
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
