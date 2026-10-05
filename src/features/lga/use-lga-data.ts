import { useEffect, useState } from "react"
import { assignedMohAccount } from "@/features/moh/moh-account"
import type { HealthApprovalDecision } from "@/features/moh/moh-approvals"
import { getLgaData } from "./lga-data"
import { useLga } from "./lga-session"

// Read-only bridge to decisions already recorded by the assigned MOH in this
// frontend workspace. Scope still comes from the LGA account and premises join.
export function useLgaData() {
  const { account } = useLga()
  const [decisions, setDecisions] = useState<
    Record<string, HealthApprovalDecision>
  >({})
  const [error, setError] = useState("")
  useEffect(() => {
    function refresh() {
      if (account?.councilId !== assignedMohAccount.councilId) {
        setDecisions({})
        return
      }
      try {
        const value: unknown = JSON.parse(
          localStorage.getItem(
            `ehrcms:moh:${assignedMohAccount.id}:decisions:v1`
          ) ?? "{}"
        )
        if (!value || typeof value !== "object" || Array.isArray(value))
          throw new Error("Invalid decisions")
        const entries = Object.entries(value).filter(([, decision]) => {
          if (
            !decision ||
            typeof decision !== "object" ||
            typeof decision.decidedAt !== "string" ||
            !Number.isFinite(Date.parse(decision.decidedAt))
          )
            return false
          return (
            (decision.outcome === "approved" &&
              typeof decision.certificateNumber === "string") ||
            (decision.outcome === "denied" &&
              typeof decision.reason === "string")
          )
        })
        if (entries.length !== Object.keys(value).length)
          throw new Error("Invalid decision record")
        setDecisions(Object.fromEntries(entries))
        setError("")
      } catch {
        setDecisions({})
        setError(
          "Saved approval decisions could not be loaded. Please reload before using approval totals."
        )
      }
    }
    refresh()
    window.addEventListener("storage", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [account?.councilId])
  return {
    ...getLgaData(account?.councilId ?? "", {
      decisions,
      ...(error ? { submissions: [] } : {}),
    }),
    error,
  }
}
