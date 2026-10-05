import { SidebarAccountMenu } from "@/components/shared/sidebar-account-menu"
import { useEffect } from "react"
import { Outlet, useLocation } from "@tanstack/react-router"
import {
  Banknote,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileChartColumn,
  Gauge,
} from "lucide-react"
import { seedDatabase } from "@/data/seeds"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MohHeader } from "@/features/moh/moh-header"
import { MohSidebar } from "@/features/moh/moh-sidebar"
import { useLga } from "./lga-session"

export const lgaNavigation = [
  { label: "Dashboard", href: "/lga/dashboard", icon: Gauge },
  { label: "Finance", href: "/lga/finance", icon: Banknote },
  {
    label: "Health approvals",
    href: "/lga/health-approvals",
    icon: ClipboardCheck,
  },
  { label: "Premises", href: "/lga/premises", icon: Building2 },
  { label: "Inspections", href: "/lga/inspections", icon: ClipboardList },
  { label: "Reports", href: "/lga/reports", icon: FileChartColumn },
] as const

export function LgaPortal() {
  const { account, hydrated, signedOut, error, signOut } = useLga()
  const pathname = useLocation({ select: (location) => location.pathname })
  useEffect(() => {
    if (hydrated && !account)
      window.location.replace(signedOut ? "/" : "/lga/sign-in")
  }, [hydrated, account, signedOut])
  if (!hydrated || !account)
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Loading your workspace…
      </main>
    )
  const councilName =
    seedDatabase.councils.find((council) => council.id === account.councilId)
      ?.name ?? "Council"
  const title =
    lgaNavigation.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.label ?? "Dashboard"
  return (
    <SidebarProvider>
      <a
        href="#lga-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-30 focus:rounded-md focus:bg-background focus:p-3 focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>
      <MohSidebar
        pathname={pathname}
        items={lgaNavigation}
        roleLabel="LGA"
        workspaceLabel="LGA Council"
        homeHref="/lga/dashboard"
        footerClassName="border-t p-3 group-data-[collapsible=icon]:p-2"
        accountMenu={
          <SidebarAccountMenu
            name={account.name}
            label="LGA account"
            initials={account.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")}
            description={`${councilName} Council`}
            onSignOut={signOut}
          />
        }
      />
      <SidebarInset className="min-w-0">
        <MohHeader
          showAccount={false}
          title={title}
          accountName={account.name}
          councilName={councilName}
          roleLabel="LGA"
          onSignOut={signOut}
        />
        <main
          id="lga-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-20 outline-none md:p-6 md:pb-24 lg:p-8 lg:pb-28"
        >
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
