import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { DemoRole } from "@/domain/types"

const labels: Record<DemoRole, string> = {
  admin: "Admin",
  "super-admin": "Super Admin",
  eho: "Environmental Health Officer",
  "moh-director": "MOH Director",
  "finance-officer": "Finance Officer",
  "business-user": "Business User",
}
type Session = {
  role: DemoRole
  roleLabel: string
  councilId: string
  setRole: (role: DemoRole) => void
  setCouncilId: (id: string) => void
}
const DemoSessionContext = createContext<Session | null>(null)

export function DemoSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<DemoRole>("admin")
  const [councilId, setCouncilId] = useState("phc")
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("ehrcms:demo-session") ?? "null"
      )
      if (saved?.role) setRole(saved.role)
      if (saved?.councilId) setCouncilId(saved.councilId)
    } catch {
      /* use defaults */
    }
  }, [])
  useEffect(() => {
    localStorage.setItem(
      "ehrcms:demo-session",
      JSON.stringify({ role, councilId })
    )
  }, [role, councilId])
  const value = useMemo(
    () => ({ role, roleLabel: labels[role], councilId, setRole, setCouncilId }),
    [role, councilId]
  )
  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  )
}

export function useDemoSession() {
  const value = useContext(DemoSessionContext)
  if (!value)
    throw new Error("useDemoSession must be used within DemoSessionProvider")
  return value
}

export { labels as roleLabels }
