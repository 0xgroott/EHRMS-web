import { Outlet, useLocation } from "@tanstack/react-router"
import { ClipboardCheck } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { buttonVariants } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BusinessHeader } from "./business-header"
import { BusinessSidebar } from "./business-sidebar"

export function BusinessShell() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const { state } = useBusinessSession()
  const kybIncomplete =
    Boolean(state.profile?.verified) &&
    (state.stage !== "complete" || !state.profile?.premises)
  const showKybBanner =
    kybIncomplete &&
    (pathname === "/business/dashboard" || pathname === "/business/settings")
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
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-20 outline-none md:p-6 md:pb-24 lg:p-8 lg:pb-28"
        >
          {showKybBanner && (
            <section
              aria-label="Business verification required"
              className="flex w-full flex-col gap-4 rounded-xl border border-[var(--border-error)] bg-[var(--background-error)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <ClipboardCheck
                  aria-hidden="true"
                  className="size-8 shrink-0 text-[var(--icon-error)]"
                />
                <p className="min-w-0 self-center font-medium text-[var(--text-error)]">
                  Complete KYB to use the app
                </p>
              </div>
              <a
                href="/business/settings#kyb"
                className={buttonVariants({
                  className: "min-h-11 shrink-0 self-start sm:self-auto",
                })}
              >
                Complete KYB
              </a>
            </section>
          )}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
