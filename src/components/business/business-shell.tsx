import { Outlet, useLocation } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BusinessHeader } from "./business-header"
import { BusinessSidebar } from "./business-sidebar"

export function BusinessShell() {
  const pathname = useLocation({ select: (location) => location.pathname })
  if (
    pathname === "/business/fitness/apply" ||
    pathname === "/business/fumigation/apply"
  ) {
    return (
      <>
        <a
          href="#business-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-30 focus:rounded-md focus:bg-background focus:p-3"
        >
          Skip to content
        </a>
        <main
          id="business-content"
          tabIndex={-1}
          className="min-h-screen outline-none"
        >
          <Outlet />
        </main>
      </>
    )
  }
  return (
    <SidebarProvider>
      <a
        href="#business-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-30 focus:rounded-md focus:bg-background focus:p-3 focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>
      <BusinessSidebar pathname={pathname} />
      <SidebarInset className="min-w-0">
        <BusinessHeader />
        <div
          id="business-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 p-4 pb-20 outline-none md:p-6 md:pb-24 lg:p-8 lg:pb-28"
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
