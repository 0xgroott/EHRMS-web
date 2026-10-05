import {
  AssignedAccountAccess,
  AssignedAccountSignIn,
} from "@/components/shared/assigned-account-sign-in"
import { useEffect } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { seedDatabase } from "@/data/seeds"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmptyState } from "@/components/shared/empty-state"
import { notifySuccess } from "@/components/ui/app-toast"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  assignedMohAccount,
  assignedMohCredentials,
  matchMohAccount,
  verifyMohCode,
} from "./moh-account"
import type { MohAccount } from "./moh-account"
import { MohBusinessReview, MohDashboard } from "./moh-approval-pages"
import {
  buildMohBusinessDirectory,
  MohBusinessesDirectory,
  MohPremisesOverview,
} from "./moh-businesses"
import { MohCertificateView } from "./moh-certificate-page"
import { findMohSubmission, mohSubmissions } from "./moh-approvals"
import {
  findHealthApprovalCase,
  mohHealthApprovalCases,
} from "./moh-health-approval-worklist"
import {
  MohHealthApprovalCaseDetail,
  MohHealthApprovalWorklist,
} from "./moh-health-approval-pages"
import { MohAccountMenu } from "./moh-account-menu"
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
    <AssignedAccountAccess
      account={assignedMohAccount}
      credentials={assignedMohCredentials}
      roleLabel="MOH"
      onUse={onUse}
      disabled={disabled}
    />
  )
}

export function MohSignInPage() {
  const session = useMoh()
  return (
    <AssignedAccountSignIn
      account={assignedMohAccount}
      credentials={assignedMohCredentials}
      roleLabel="MOH"
      workspaceLabel="MOH / Director"
      headline="Decisions in one place."
      description="Access your assigned review and approval workspace."
      destination="/moh/health-approvals"
      session={session}
      matchAccount={matchMohAccount}
      verifyCode={verifyMohCode}
    />
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
        {!hydrated ? "Loading MOH workspace…" : "Opening MOH sign-in…"}
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
      <MohSidebar
        pathname={pathname}
        accountMenu={
          <MohAccountMenu
            sidebar
            accountName={account.name}
            councilName={councilName}
            onSignOut={() => {
              if (signOut()) window.location.assign("/")
            }}
          />
        }
      />
      <SidebarInset className="min-w-0">
        <MohHeader
          showAccount={false}
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

export function MohHealthApprovalsPage() {
  const { decisions } = useMoh()
  return (
    <MohWorkspace title="Health approvals">
      <MohDashboard submissions={mohSubmissions} decisions={decisions} />
    </MohWorkspace>
  )
}

export function MohInspectionsPage() {
  const { scheduledInspections } = useMoh()
  const preDecisionCases = mohHealthApprovalCases.map(
    (workCase) => scheduledInspections[workCase.id] ?? workCase
  )

  return (
    <MohWorkspace title="Inspections">
      <MohHealthApprovalWorklist cases={preDecisionCases} />
    </MohWorkspace>
  )
}

export function MohInspectionCasePage({ caseId }: { caseId: string }) {
  const { scheduledInspections, scheduleInspection } = useMoh()
  const workCase =
    scheduledInspections[caseId] ??
    findHealthApprovalCase(mohHealthApprovalCases, caseId)

  return (
    <MohWorkspace title="Inspection">
      {workCase ? (
        <MohHealthApprovalCaseDetail
          workCase={workCase}
          onSchedule={(input) => {
            const scheduled = scheduleInspection(workCase.id, input)
            if (scheduled) notifySuccess("Approval inspection scheduled.")
            return scheduled
          }}
        />
      ) : (
        <div className="flex max-w-xl flex-col gap-4 py-12">
          <h1 className="text-2xl font-semibold tracking-tight">
            Inspection case not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This case may have been removed or the link may be incorrect.
          </p>
          <Button
            variant="outline"
            className="min-h-11 w-fit"
            nativeButton={false}
            render={<Link to="/moh/inspections" />}
          >
            Return to inspections
          </Button>
        </div>
      )}
    </MohWorkspace>
  )
}

export function MohBusinessesPage() {
  const { account } = useMoh()
  const councilId = account?.councilId ?? assignedMohAccount.councilId
  const businesses = buildMohBusinessDirectory(seedDatabase.premises, councilId)

  return (
    <MohWorkspace title="Premises">
      <MohBusinessesDirectory businesses={businesses} showMetrics />
    </MohWorkspace>
  )
}

export function MohPremisesPage({ premisesId }: { premisesId: string }) {
  const { account } = useMoh()
  const premises = seedDatabase.premises.find(
    (item) => item.id === premisesId && item.councilId === account?.councilId
  )

  return (
    <MohWorkspace title="Premises overview">
      {premises ? (
        <MohPremisesOverview premises={premises} />
      ) : (
        <EmptyState
          title="Premises record not found"
          description="This record may no longer be available or may belong to another council."
        />
      )}
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
            render={<Link to="/moh/health-approvals" />}
          >
            Return to Health Approvals
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
