import { useEffect, useState } from "react"
import { assignedLgaAccount } from "@/features/lga/lga-account"
import { Outlet } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export function AppShell() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // The legacy console has no assigned-account gate. Keep an active LGA
    // session in its read-only workspace, including on direct legacy links.
    try {
      if (
        localStorage.getItem("ehrcms:lga:session:v1") === assignedLgaAccount.id
      ) {
        window.location.replace("/lga/dashboard")
        return
      }
      setReady(true)
    } catch {
      window.location.replace("/")
    }
  }, [])
  if (!ready)
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Opening your workspace…
      </main>
    )
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
