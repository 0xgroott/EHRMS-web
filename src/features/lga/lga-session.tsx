import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { assignedLgaAccount } from "./lga-account"
import type { LgaAccount } from "./lga-account"

const sessionKey = "ehrcms:lga:session:v1"
interface LgaSessionValue {
  account: LgaAccount | null
  hydrated: boolean
  signedOut: boolean
  error: string | null
  signIn: (account: LgaAccount) => boolean
  signOut: () => boolean
}
const LgaSession = createContext<LgaSessionValue | null>(null)
export function LgaProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<LgaAccount | null>(null)
  const [signedOut, setSignedOut] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    try {
      setAccount(
        localStorage.getItem(sessionKey) === assignedLgaAccount.id
          ? assignedLgaAccount
          : null
      )
    } catch {
      setError("Unable to read your account on this device.")
    }
    setHydrated(true)
  }, [])
  function signIn(next: LgaAccount) {
    if (next.id !== assignedLgaAccount.id) return false
    try {
      localStorage.setItem(sessionKey, assignedLgaAccount.id)
      setAccount(assignedLgaAccount)
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
    <LgaSession.Provider
      value={{ account, hydrated, signedOut, error, signIn, signOut }}
    >
      {children}
    </LgaSession.Provider>
  )
}
export function useLga() {
  const session = useContext(LgaSession)
  if (!session) throw new Error("LGA session is missing")
  return session
}
