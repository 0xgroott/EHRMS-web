import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { assignedMohAccount } from "./moh-account"
import type { MohAccount } from "./moh-account"

const sessionKey = "ehrcms:moh:session:v1"

interface MohSessionValue {
  account: MohAccount | null
  hydrated: boolean
  signedOut: boolean
  error: string | null
  signIn: (account: MohAccount) => boolean
  signOut: () => boolean
}

const MohSession = createContext<MohSessionValue | null>(null)

export function MohProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<MohAccount | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setAccount(
        localStorage.getItem(sessionKey) === assignedMohAccount.id
          ? assignedMohAccount
          : null
      )
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

  return (
    <MohSession.Provider
      value={{ account, hydrated, signedOut, error, signIn, signOut }}
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
