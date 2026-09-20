import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { PageHeader } from "@/components/shared/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { matchMohAccount, verifyMohCode } from "./moh-account"
import type { MohAccount } from "./moh-account"
import { useMoh } from "./moh-session"

export function MohSignInPage() {
  const session = useMoh()
  const [contact, setContact] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingAccount, setPendingAccount] = useState<MohAccount | null>(null)
  const [error, setError] = useState("")

  function submitCredentials(event: React.FormEvent) {
    event.preventDefault()
    if (!contact.trim() || !password) {
      setError("Enter your staff ID or email and password.")
      return
    }
    const account = matchMohAccount(contact, password)
    if (!account) {
      setError("Staff ID, email or password is incorrect.")
      return
    }
    setPassword("")
    setPendingAccount(account)
    setError("")
  }

  function submitCode(event: React.FormEvent) {
    event.preventDefault()
    if (!pendingAccount || !verifyMohCode(code)) {
      setError("Enter the correct six-digit verification code.")
      return
    }
    if (session.signIn(pendingAccount)) window.location.assign("/moh/home")
  }

  return (
    <main className="min-h-svh bg-background md:grid md:grid-cols-[minmax(18rem,.85fr)_minmax(0,1.15fr)]">
      <section className="flex flex-col bg-primary p-6 text-primary-foreground md:p-12 lg:p-16">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-7" aria-hidden="true" />
          <div>
            <strong className="block text-lg">EHRCMS</strong>
            <span className="text-sm">MOH / Director</span>
          </div>
        </div>
        <div className="hidden max-w-sm flex-1 flex-col justify-center gap-5 md:flex">
          <h2 className="text-3xl font-semibold tracking-tight">
            Decisions in one place.
          </h2>
          <p className="leading-relaxed">
            Access your assigned review and approval workspace.
          </p>
        </div>
        <p className="hidden text-xs md:block">
          Environmental Health Regulatory Case Management System
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 md:px-12">
        <div className="w-full max-w-md space-y-7">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Choose another
            account type
          </Link>
          <header className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Assigned account
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {pendingAccount ? "Verify your sign-in" : "Sign in as MOH"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pendingAccount
                ? "Enter the six-digit code for your assigned account."
                : "Use the account provided by your council administrator."}
            </p>
          </header>
          {(error || session.error) && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error || session.error}</AlertDescription>
            </Alert>
          )}
          {pendingAccount ? (
            <form className="grid gap-5" onSubmit={submitCode} noValidate>
              <div className="grid gap-2">
                <label htmlFor="moh-code" className="text-sm font-medium">
                  Verification code
                </label>
                <Input
                  id="moh-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value)
                    setError("")
                  }}
                  className="min-h-11"
                  maxLength={6}
                  disabled={!session.hydrated}
                />
              </div>
              <Button
                type="submit"
                className="min-h-11"
                disabled={!session.hydrated}
              >
                Verify and sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() => {
                  setPendingAccount(null)
                  setCode("")
                  setError("")
                }}
              >
                Use another account
              </Button>
            </form>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={submitCredentials}
              noValidate
            >
              <div className="grid gap-2">
                <label htmlFor="moh-contact" className="text-sm font-medium">
                  Staff ID or email
                </label>
                <Input
                  id="moh-contact"
                  autoComplete="username"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="min-h-11"
                  disabled={!session.hydrated}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="moh-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="moh-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-11"
                  disabled={!session.hydrated}
                />
              </div>
              <Button
                type="submit"
                className="min-h-11"
                disabled={!session.hydrated}
              >
                Continue <ArrowRight aria-hidden="true" />
              </Button>
            </form>
          )}
          <p className="text-sm text-muted-foreground">
            Need access or forgot your password? Contact your council
            administrator.
          </p>
        </div>
      </section>
    </main>
  )
}

export function MohHomePage() {
  const { account, hydrated, signedOut, error, signOut } = useMoh()
  useEffect(() => {
    if (hydrated && !account)
      window.location.replace(signedOut ? "/" : "/moh/sign-in")
  }, [hydrated, account, signedOut])
  if (!hydrated || !account)
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Opening MOH sign-in…
      </main>
    )
  const council = seedDatabase.councils.find(
    (item) => item.id === account.councilId
  )
  return (
    <div className="min-h-svh bg-muted/30">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b bg-background px-5 md:px-10">
        <div className="flex items-center gap-3 font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>{" "}
          EHRCMS{" "}
          <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
            MOH / Director
          </span>
        </div>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => {
            if (signOut()) window.location.assign("/")
          }}
        >
          <LogOut aria-hidden="true" /> Sign out
        </Button>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10 md:px-10">
        <PageHeader
          eyebrow="MOH / Director"
          title="MOH workspace"
          description={`Signed in as ${account.name} · ${council?.name ?? "Council"} Council`}
        />
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle
              role="heading"
              aria-level={2}
              className="flex items-center gap-2"
            >
              <Stethoscope className="size-5 text-primary" aria-hidden="true" />{" "}
              Your account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Staff ID:</span>{" "}
              {account.id}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {account.email}
            </p>
            <p className="pt-3 text-muted-foreground">
              No cases are assigned to this account.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
