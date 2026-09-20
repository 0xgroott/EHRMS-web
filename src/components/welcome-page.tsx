import { useEffect, useState } from "react"
import {
  Building2,
  Check,
  ClipboardCheck,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type AccountType = "business" | "eho" | "moh"

const accountTypes = [
  {
    id: "business",
    title: "Business",
    description:
      "Manage premises, applications, certificates, and inspection actions.",
    icon: Building2,
    path: "/business/sign-in",
  },
  {
    id: "eho",
    title: "Environmental Health Officer",
    description:
      "Continue assigned inspections, follow-ups, and field supervision.",
    icon: ClipboardCheck,
    path: "/eho/sign-in",
  },
  {
    id: "moh",
    title: "Medical Officer of Health",
    description: "Sign in to your review and decision workspace.",
    icon: Stethoscope,
    path: "/moh/sign-in",
  },
] as const

export function WelcomePage() {
  const [selected, setSelected] = useState<AccountType | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  const destination = accountTypes.find(
    (account) => account.id === selected
  )?.path

  return (
    <main className="min-h-svh bg-background px-5 pt-8 pb-12 sm:px-8 md:pt-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center gap-3 text-sm font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span>EHRCMS</span>
        </header>

        <div className="mx-auto max-w-3xl pt-16 text-center sm:pt-24">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Welcome
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Choose your account type
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Select how you use EHRCMS, then sign in to your account.
          </p>
        </div>

        <form
          className="mx-auto mt-14 max-w-5xl sm:mt-20"
          onSubmit={(event) => {
            event.preventDefault()
            if (destination) window.location.assign(destination)
          }}
        >
          <fieldset>
            <legend className="sr-only">Account type</legend>
            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
              {accountTypes.map(({ id, title, description, icon: Icon }) => (
                <label key={id} className="group relative cursor-pointer">
                  <input
                    type="radio"
                    name="account-type"
                    value={id}
                    aria-label={title}
                    disabled={!ready}
                    checked={selected === id}
                    onChange={() => setSelected(id)}
                    className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  />
                  <span className="flex min-h-52 flex-col rounded-xl border border-border bg-card p-6 shadow-xs transition-[border-color,background-color,box-shadow] duration-150 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary hover:border-primary/50">
                    <span className="flex items-start justify-between gap-2">
                      <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <Check
                        className={`size-5 text-primary ${selected === id ? "opacity-100" : "opacity-0"}`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-6 text-lg leading-snug font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="mt-2 text-sm leading-6 text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={!destination}
              className="min-h-12 w-full px-7 sm:w-auto"
            >
              Continue to sign in <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </form>
        <p className="mt-16 text-center text-xs text-muted-foreground">
          Environmental Health Regulatory Case Management System
        </p>
      </div>
    </main>
  )
}
