import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface AssignedAccount {
  id: string
  name: string
  email: string
  councilId: string
}

export function AssignedAccountAccess({
  account,
  credentials,
  roleLabel,
  onUse,
  disabled = false,
}: {
  account: AssignedAccount
  credentials: { password: string; verificationCode: string }
  roleLabel: string
  onUse: (account: AssignedAccount) => void
  disabled?: boolean
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Quick access</CardTitle>
        <CardDescription>
          Use the assigned {roleLabel} account for this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Staff ID</dt>
            <dd className="mt-0.5 font-medium">{account.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 font-medium break-all">{account.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Password</dt>
            <dd className="mt-0.5 font-medium">{credentials.password}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Verification code</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {credentials.verificationCode}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="min-h-11 w-full"
          disabled={disabled}
          onClick={() => onUse(account)}
        >
          Use assigned account
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export function AssignedAccountSignIn({
  account,
  credentials,
  roleLabel,
  workspaceLabel,
  headline,
  description,
  destination,
  session,
  matchAccount,
  verifyCode,
}: {
  account: AssignedAccount
  credentials: { password: string; verificationCode: string }
  roleLabel: string
  workspaceLabel: string
  headline: string
  description: string
  destination: string
  session: {
    hydrated: boolean
    error: string | null
    signIn: (account: AssignedAccount) => boolean
  }
  matchAccount: (contact: string, password: string) => AssignedAccount | null
  verifyCode: (code: string) => boolean
}) {
  const [contact, setContact] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingAccount, setPendingAccount] = useState<AssignedAccount | null>(
    null
  )
  const [error, setError] = useState("")

  function submitCredentials(event: React.FormEvent) {
    event.preventDefault()
    if (!contact.trim() || !password) {
      setError("Enter your staff ID or email and password.")
      return
    }
    const matchedAccount = matchAccount(contact, password)
    if (!matchedAccount) {
      setError("Staff ID, email or password is incorrect.")
      return
    }
    setPassword("")
    setPendingAccount(matchedAccount)
    setError("")
  }

  function submitCode(event: React.FormEvent) {
    event.preventDefault()
    if (!pendingAccount || !verifyCode(code)) {
      setError("Enter the correct six-digit verification code.")
      return
    }
    if (session.signIn(pendingAccount)) window.location.assign(destination)
  }

  return (
    <main className="min-h-svh bg-background md:grid md:grid-cols-[minmax(18rem,.85fr)_minmax(0,1.15fr)]">
      <section className="flex flex-col bg-primary p-6 text-primary-foreground md:p-12 lg:p-16">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-7" aria-hidden="true" />
          <div>
            <strong className="block text-lg">EHRCMS</strong>
            <span className="text-sm">{workspaceLabel}</span>
          </div>
        </div>
        <div className="hidden max-w-sm flex-1 flex-col justify-center gap-5 md:flex">
          <h2 className="text-3xl font-semibold tracking-tight">{headline}</h2>
          <p className="leading-relaxed">{description}</p>
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
              {pendingAccount
                ? "Verify your sign-in"
                : `Sign in as ${roleLabel}`}
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
          {!pendingAccount && (
            <AssignedAccountAccess
              account={account}
              credentials={credentials}
              roleLabel={roleLabel}
              disabled={!session.hydrated}
              onUse={(selectedAccount) => {
                if (session.signIn(selectedAccount))
                  window.location.assign(destination)
              }}
            />
          )}
          {pendingAccount ? (
            <form className="grid gap-5" onSubmit={submitCode} noValidate>
              <div className="grid gap-2">
                <label htmlFor="assigned-code" className="text-sm font-medium">
                  Verification code
                </label>
                <Input
                  id="assigned-code"
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
                <label
                  htmlFor="assigned-contact"
                  className="text-sm font-medium"
                >
                  Staff ID or email
                </label>
                <Input
                  id="assigned-contact"
                  autoComplete="username"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="min-h-11"
                  disabled={!session.hydrated}
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="assigned-password"
                  className="text-sm font-medium"
                >
                  Password
                </label>
                <Input
                  id="assigned-password"
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
