import { useEffect, useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"
import { seedDatabase } from "@/data/seeds"
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
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  assignedMohAccount,
  assignedMohCredentials,
  matchMohAccount,
  verifyMohCode,
} from "./moh-account"
import type { MohAccount } from "./moh-account"
import { MohBusinessReview, MohDashboard } from "./moh-approval-pages"
import { MohCertificateView } from "./moh-certificate-page"
import { findMohSubmission, mohSubmissions } from "./moh-approvals"
import { MohHeader } from "./moh-header"
import { useMoh } from "./moh-session"
import { MohSidebar } from "./moh-sidebar"

export function MohAssignedAccountAccess({
  onUse,
  disabled = false,
}: {
  onUse: (account: MohAccount) => void
  disabled?: boolean
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Quick access</CardTitle>
        <CardDescription>
          Use the assigned MOH account for this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Staff ID</dt>
            <dd className="mt-0.5 font-medium">{assignedMohAccount.id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-0.5 font-medium break-all">
              {assignedMohAccount.email}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Password</dt>
            <dd className="mt-0.5 font-medium">
              {assignedMohCredentials.password}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Verification code</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {assignedMohCredentials.verificationCode}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="min-h-11 w-full"
          disabled={disabled}
          onClick={() => onUse(assignedMohAccount)}
        >
          Use assigned account
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}

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
          {!pendingAccount && (
            <MohAssignedAccountAccess
              disabled={!session.hydrated}
              onUse={(account) => {
                if (session.signIn(account)) window.location.assign("/moh/home")
              }}
            />
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

function MohWorkspace({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const { account, hydrated, signedOut, error, signOut } = useMoh()
  const pathname = useLocation({ select: (location) => location.pathname })
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
  const councilName = council?.name ?? "Council"
  return (
    <SidebarProvider>
      <a
        href="#moh-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-30 focus:rounded-md focus:bg-background focus:p-3 focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>
      <MohSidebar pathname={pathname} />
      <SidebarInset className="min-w-0">
        <MohHeader
          title={title}
          accountName={account.name}
          councilName={councilName}
          onSignOut={() => {
            if (signOut()) window.location.assign("/")
          }}
        />
        <div
          id="moh-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-20 outline-none md:p-6 md:pb-24 lg:p-8 lg:pb-28"
        >
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function MohHomePage() {
  const { decisions } = useMoh()
  return (
    <MohWorkspace title="Dashboard">
      <MohDashboard submissions={mohSubmissions} decisions={decisions} />
    </MohWorkspace>
  )
}

export function MohBusinessReviewPage({
  submissionId,
}: {
  submissionId: string
}) {
  const { decisions, approveHealthApproval, denyHealthApproval } = useMoh()
  const submission = findMohSubmission(submissionId)

  return (
    <MohWorkspace title="Business review">
      {submission ? (
        <MohBusinessReview
          submission={submission}
          decision={decisions[submission.id]}
          onApprove={approveHealthApproval}
          onDeny={denyHealthApproval}
        />
      ) : (
        <div className="flex max-w-xl flex-col gap-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight">
            Submission not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This Health Approval submission may have been removed or the link
            may be incorrect.
          </p>
          <Button
            variant="outline"
            className="min-h-11 w-fit"
            nativeButton={false}
            render={<Link to="/moh/home" />}
          >
            Return to dashboard
          </Button>
        </div>
      )}
    </MohWorkspace>
  )
}

export function MohCertificatePage({ submissionId }: { submissionId: string }) {
  const { account, decisions, hydrated, signedOut } = useMoh()
  const submission = findMohSubmission(submissionId)
  const decision = decisions[submissionId]

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

  if (!submission || decision?.outcome !== "approved")
    return (
      <main className="grid min-h-svh place-items-center px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Certificate unavailable
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This certificate is not available because the Health Approval has
            not been issued or the submission could not be found.
          </p>
        </div>
      </main>
    )

  return <MohCertificateView submission={submission} decision={decision} />
}
