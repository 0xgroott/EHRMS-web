import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "@tanstack/react-router"
import { ClipboardCheck, Menu, Search, UserRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEho } from "./eho-session"

const navigation = [
  { label: "My Work", href: "/eho/my-work", icon: ClipboardCheck },
  { label: "Premises Search", href: "/eho/premises-search", icon: Search },
  { label: "Profile / Sync", href: "/eho/profile", icon: UserRound },
] as const

export function EhoPortal() {
  const { officer, hydrated, signedOut, error } = useEho()
  const [open, setOpen] = useState(false)
  const pathname = useLocation({ select: (location) => location.pathname })
  useEffect(() => {
    if (hydrated && !officer)
      window.location.replace(signedOut ? "/" : "/eho/sign-in")
  }, [hydrated, officer, signedOut])
  if (!hydrated)
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Loading fieldwork…
      </main>
    )
  if (!officer) {
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Opening EHO sign-in…
      </main>
    )
  }
  return (
    <div className="min-h-svh bg-muted/30 md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#eho-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <aside
        className={`${open ? "fixed inset-0 z-40 bg-background p-5" : "hidden"} border-r md:sticky md:top-0 md:block md:h-svh md:p-5`}
      >
        <div className="mb-9 flex items-center justify-between">
          <Link
            to="/eho/my-work"
            className="flex items-center gap-3 font-semibold"
            onClick={() => setOpen(false)}
          >
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              EH
            </span>
            <span>
              EHRCMS{" "}
              <small className="block font-normal text-muted-foreground">
                Field officer
              </small>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="size-11 md:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <nav aria-label="EHO navigation" className="grid gap-1">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm ${pathname === href ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 border-t pt-5 text-xs leading-5 text-muted-foreground">
          Assigned work for {officer.name}
          <br />
          Port Harcourt City Council
        </p>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="size-11 md:hidden"
            aria-label="Open EHO navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <span className="text-sm font-medium">
            Environmental Health Officer
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {officer.name}
          </span>
        </header>
        {error && (
          <p
            role="alert"
            className="mx-4 mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive md:mx-8"
          >
            {error}
          </p>
        )}
        <main
          id="eho-content"
          tabIndex={-1}
          className="mx-auto max-w-6xl p-4 outline-none md:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
