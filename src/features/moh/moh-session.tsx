import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { assignedMohAccount } from "./moh-account"
import type { MohAccount } from "./moh-account"
import type { HealthApprovalDecision } from "./moh-approvals"
import {
  mohHealthApprovalCases,
  scheduleHealthApprovalInspection,
} from "./moh-health-approval-worklist"
import type { HealthApprovalWorkCase } from "./moh-health-approval-worklist"

const sessionKey = "ehrcms:moh:session:v1"
const decisionsKey = `ehrcms:moh:${assignedMohAccount.id}:decisions:v1`
const scheduledInspectionsKey = `ehrcms:moh:${assignedMohAccount.id}:health-approval-inspections:v1`

interface MohSessionValue {
  account: MohAccount | null
  hydrated: boolean
  signedOut: boolean
  error: string | null
  decisions: Partial<Record<string, HealthApprovalDecision>>
  scheduledInspections: Partial<Record<string, HealthApprovalWorkCase>>
  signIn: (account: MohAccount) => boolean
  signOut: () => boolean
  approveHealthApproval: (submissionId: string) => void
  denyHealthApproval: (submissionId: string, reason: string) => void
  scheduleInspection: (
    caseId: string,
    input: { officer: string; scheduledAt: string }
  ) => boolean
}

const MohSession = createContext<MohSessionValue | null>(null)

export function MohProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<MohAccount | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decisions, setDecisions] = useState<
    Partial<Record<string, HealthApprovalDecision>>
  >({})
  const [scheduledInspections, setScheduledInspections] = useState<
    Partial<Record<string, HealthApprovalWorkCase>>
  >({})

  useEffect(() => {
    try {
      setAccount(
        localStorage.getItem(sessionKey) === assignedMohAccount.id
          ? assignedMohAccount
          : null
      )
      const savedDecisions = localStorage.getItem(decisionsKey)
      if (savedDecisions) {
        const parsed = JSON.parse(savedDecisions) as Partial<
          Record<string, HealthApprovalDecision>
        >
        setDecisions(parsed)
      }
    } catch {
      setError("Unable to read your account on this device.")
    }
    try {
      const savedInspections = localStorage.getItem(scheduledInspectionsKey)
      if (savedInspections) {
        const parsed = JSON.parse(savedInspections) as unknown
        if (parsed && typeof parsed === "object") {
          setScheduledInspections(
            Object.fromEntries(
              Object.entries(parsed).filter(
                ([, value]) =>
                  value !== null &&
                  typeof value === "object" &&
                  (value as HealthApprovalWorkCase).stage === "inspection" &&
                  typeof (value as HealthApprovalWorkCase).id === "string"
              )
            )
          )
        }
      }
    } catch {
      setScheduledInspections({})
    }
    setHydrated(true)
  }, [])

  function signIn(next: MohAccount) {
    if (next.id !== assignedMohAccount.id) return false
    try {
      localStorage.setItem(sessionKey, next.id)
      setAccount(next)
      setSignedOut(false)
      setError(null)
      return true
    } catch {
      setError("Unable to save your session on this device.")
      return false
    }
  }

  function signOut() {
    try {
      localStorage.removeItem(sessionKey)
      setAccount(null)
      setSignedOut(true)
      setError(null)
      return true
    } catch {
      setError("Unable to sign out. Try again.")
      return false
    }
  }

  function approveHealthApproval(submissionId: string) {
    setDecisions((current) => {
      const next: Partial<Record<string, HealthApprovalDecision>> = {
        ...current,
        [submissionId]: {
          outcome: "approved",
          decidedAt: new Date().toISOString(),
          certificateNumber: submissionId.replace("HA-REV", "HAC-2026"),
        },
      }
      try {
        localStorage.setItem(decisionsKey, JSON.stringify(next))
        setError(null)
      } catch {
        setError("Unable to save this decision on this device.")
      }
      return next
    })
  }

  function denyHealthApproval(submissionId: string, reason: string) {
    setDecisions((current) => {
      const next: Partial<Record<string, HealthApprovalDecision>> = {
        ...current,
        [submissionId]: {
          outcome: "denied",
          decidedAt: new Date().toISOString(),
          reason,
        },
      }
      try {
        localStorage.setItem(decisionsKey, JSON.stringify(next))
        setError(null)
      } catch {
        setError("Unable to save this decision on this device.")
      }
      return next
    })
  }

  function scheduleInspection(
    caseId: string,
    input: { officer: string; scheduledAt: string }
  ) {
    const workCase = mohHealthApprovalCases.find((item) => item.id === caseId)
    if (!workCase) {
      setError("This Health Approval case could not be found.")
      return false
    }
    try {
      const scheduled = scheduleHealthApprovalInspection(workCase, input)
      setScheduledInspections((current) => {
        const next = { ...current, [caseId]: scheduled }
        localStorage.setItem(scheduledInspectionsKey, JSON.stringify(next))
        return next
      })
      setError(null)
      return true
    } catch (scheduleError) {
      setError(
        scheduleError instanceof Error
          ? scheduleError.message
          : "Unable to schedule this inspection."
      )
      return false
    }
  }

  return (
    <MohSession.Provider
      value={{
        account,
        hydrated,
        signedOut,
        error,
        decisions,
        scheduledInspections,
        signIn,
        signOut,
        approveHealthApproval,
        denyHealthApproval,
        scheduleInspection,
      }}
    >
      {children}
    </MohSession.Provider>
  )
}

export function useMoh() {
  const session = useContext(MohSession)
  if (!session) throw new Error("MOH session is missing")
  return session
}
