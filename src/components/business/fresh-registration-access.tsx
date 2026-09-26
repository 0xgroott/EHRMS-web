import type { ReactNode } from "react"
import { ONBOARDING_BUSINESS_CREDENTIALS } from "@/data/business-seeds"

export function FreshRegistrationAccess({
  signInLink,
}: {
  signInLink: ReactNode
}) {
  return (
    <section
      aria-labelledby="fresh-registration-title"
      className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id="fresh-registration-title" className="text-sm font-semibold">
          Start a fresh registration
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use these details on the sign-in page whenever you want to begin
          onboarding again.
        </p>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">Email</dt>
          <dd className="mt-1 font-medium break-all select-all">
            {ONBOARDING_BUSINESS_CREDENTIALS.email}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">
            Password
          </dt>
          <dd className="mt-1 font-medium break-all select-all">
            {ONBOARDING_BUSINESS_CREDENTIALS.password}
          </dd>
        </div>
      </dl>
      <div className="self-start">{signInLink}</div>
    </section>
  )
}
