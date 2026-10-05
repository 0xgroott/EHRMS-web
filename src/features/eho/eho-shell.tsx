import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "@tanstack/react-router"
import {
  ClipboardCheck,
  CloudUpload,
  LogOut,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react"
import { cn } from "cn"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeMenuGroup } from "@/components/shared/theme-menu-group"
import { useEho } from "./eho-session"

const navigation = [
  { label: "Dashboard", href: "/eho/my-work", icon: ClipboardCheck },
  { label: "All Premises", href: "/eho/premises-search", icon: Search },
  { label: "Sync Data", href: "/eho/sync-data", icon: CloudUpload },
] as const

export function EhoPortal() {
  const { officer, hydrated, signedOut, error, signOut } = useEho()
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const pathname = useLocation({ select: (location) => location.pathname })
  const inspectionFlow =
    /^\/eho\/inspections\/[^/]+\/(checklist|issues(?:\/|$)|review|result|findings|follow-up)/.test(
      pathname
    )
  useEffect(() => {
    if (hydrated && !officer)
      window.location.replace(signedOut ? "/" : "/eho/sign-in")
  }, [hydrated, officer, signedOut])
  if (!hydrated) return null
  if (!officer) {
    return (
      <main className="grid min-h-svh place-items-center" role="status">
        Opening EHO sign-in…
      </main>
    )
  }
  const officerInitials = officer.name
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function leave() {
    if (signOut()) window.location.assign("/")
  }

  return (
    <div
      className={cn(
        "min-h-svh bg-muted/30",
        !inspectionFlow && "md:grid md:grid-cols-[15rem_minmax(0,1fr)]"
      )}
    >
      <a
        href="#eho-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      {!inspectionFlow && (
        <aside
          className={cn(
            "flex-col border-r bg-background p-5 pb-12 md:sticky md:top-0 md:flex md:h-svh md:pb-10",
            open ? "fixed inset-0 z-40 flex" : "hidden"
          )}
        >
          <div className="mb-9 flex items-center justify-between">
            <Link
              to="/eho/my-work"
              className="flex items-center gap-3 font-semibold"
              onClick={() => setOpen(false)}
            >
              <img
                src="/favicon/logo-green-48.svg"
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                className="size-9 shrink-0 rounded-lg"
              />
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
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm",
                  pathname === href
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t pt-4">
            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out of EHRCMS?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your saved drafts and queued inspections will stay on this
                    device. You can continue when you sign in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                  <AlertDialogAction onClick={leave}>Log out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "flex min-h-16 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      pathname === "/eho/profile"
                        ? "border-primary/30 bg-primary/10"
                        : "bg-muted/40 hover:bg-muted"
                    )}
                  />
                }
                aria-label={`EHO account — ${officer.name}`}
              >
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {officerInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-semibold">
                    {officer.name}
                  </strong>
                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                    EHO
                  </span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-60 max-w-[calc(100vw-2rem)]"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{officer.name}</DropdownMenuLabel>
                  <DropdownMenuItem
                    render={<Link to="/eho/profile" />}
                    onClick={() => setOpen(false)}
                    className="min-h-11"
                  >
                    <UserRound aria-hidden="true" />
                    View profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <ThemeMenuGroup />
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setLogoutOpen(true)}
                    className="min-h-11"
                  >
                    <LogOut aria-hidden="true" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      )}
      <div className="min-w-0">
        {!inspectionFlow && (
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
          </header>
        )}
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
          className={cn(
            "outline-none",
            inspectionFlow
              ? "max-w-none"
              : "mx-auto max-w-6xl px-4 pt-4 pb-20 md:px-8 md:pt-8 md:pb-24"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
