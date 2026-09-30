import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { assignedMohAccount } from "./moh-account"
import type { MohAccount } from "./moh-account"
import type { HealthApprovalDecision } from "./moh-approvals"

const sessionKey = "ehrcms:moh:session:v1"
const decisionsKey = `ehrcms:moh:${assignedMohAccount.id}:decisions:v1`

interface MohSessionValue {
  account: MohAccount | null
  hydrated: boolean
  signedOut: boolean
  error: string | null
  decisions: Partial<Record<string, HealthApprovalDecision>>
  signIn: (account: MohAccount) => boolean
  signOut: () => boolean
  approveHealthApproval: (submissionId: string) => void
  denyHealthApproval: (submissionId: string, reason: string) => void
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

  return (
    <MohSession.Provider
      value={{
        account,
        hydrated,
        signedOut,
        error,
        decisions,
        signIn,
        signOut,
        approveHealthApproval,
        denyHealthApproval,
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
