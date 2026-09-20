import { createContext, useContext, useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { assignments, officers } from "./eho-model"
import type { Fieldwork, Officer } from "./eho-model"
import { initialFieldwork, readFieldwork, saveFieldwork } from "./eho-state"

const SESSION_KEY = "ehrcms:eho:session:v1"
const FIELDWORK_KEY = "ehrcms:eho:fieldwork:v1:"

type EhoContextValue = {
  officer: Officer | null
  hydrated: boolean
  signedOut: boolean
  fieldwork: Partial<Record<string, Fieldwork>>
  error: string | null
  signIn: (officer: Officer) => boolean
  signOut: () => boolean
  getDraft: (id: string) => Fieldwork
  updateDraft: (draft: Fieldwork) => boolean
}
const EhoContext = createContext<EhoContextValue | null>(null)

export function EhoProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [officer, setOfficer] = useState<Officer | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const [fieldwork, setFieldwork] = useState<
    Partial<Record<string, Fieldwork>>
  >({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const id = localStorage.getItem(SESSION_KEY)
      const account =
        officers.find((person) => person.id === id && !person.disabled) ?? null
      setOfficer(account)
      setSignedOut(false)
      if (account) {
        const stored = readFieldwork(localStorage, account.id)
        const next =
          localStorage.getItem(FIELDWORK_KEY + account.id) === null
            ? initialFieldwork()
            : stored
        if (localStorage.getItem(FIELDWORK_KEY + account.id) === null)
          saveFieldwork(localStorage, account.id, next)
        setFieldwork(next)
        queryClient.setQueryData(["eho", "fieldwork", account.id], next)
      }
    } catch {
      setError(
        "Local EHO data is unavailable. Check browser storage and try again."
      )
    }
    setHydrated(true)
  }, [queryClient])

  function signIn(account: Officer) {
    try {
      localStorage.setItem(SESSION_KEY, account.id)
      setOfficer(account)
      setSignedOut(false)
      const saved = readFieldwork(localStorage, account.id)
      const next =
        localStorage.getItem(FIELDWORK_KEY + account.id) === null
          ? initialFieldwork()
          : saved
      if (localStorage.getItem(FIELDWORK_KEY + account.id) === null)
        saveFieldwork(localStorage, account.id, next)
      setFieldwork(next)
      queryClient.setQueryData(["eho", "fieldwork", account.id], next)
      setError(null)
      return true
    } catch {
      setError("Unable to save your session on this device.")
      return false
    }
  }

  function signOut() {
    try {
      localStorage.removeItem(SESSION_KEY)
      if (officer)
        queryClient.removeQueries({
          queryKey: ["eho", "fieldwork", officer.id],
        })
      setOfficer(null)
      setSignedOut(true)
      setFieldwork({})
      setError(null)
      return true
    } catch {
      setError("Unable to sign out. Try again.")
      return false
    }
  }

  function getDraft(id: string) {
    const assignment = assignments.find((item) => item.id === id)
    if (!assignment) throw new Error("Inspection not found")
    return (
      fieldwork[id] ?? {
        assignmentId: id,
        status: "draft" as const,
        answers: {},
        notes: {},
        issues: [],
        attendingOfficers: [...assignment.officers],
      }
    )
  }

  function updateDraft(draft: Fieldwork) {
    if (!officer || !assignments.some((item) => item.id === draft.assignmentId))
      return false
    const next = { ...fieldwork, [draft.assignmentId]: draft }
    try {
      saveFieldwork(localStorage, officer.id, next)
      setFieldwork(next)
      queryClient.setQueryData(["eho", "fieldwork", officer.id], next)
      setError(null)
      return true
    } catch {
      setError(
        "Could not save fieldwork on this device. Keep this page open and try again."
      )
      return false
    }
  }

  return (
    <EhoContext.Provider
      value={{
        officer,
        hydrated,
        signedOut,
        fieldwork,
        error,
        signIn,
        signOut,
        getDraft,
        updateDraft,
      }}
    >
      {children}
    </EhoContext.Provider>
  )
}

export function useEho() {
  const context = useContext(EhoContext)
  if (!context) throw new Error("EHO context is missing")
  return context
}
