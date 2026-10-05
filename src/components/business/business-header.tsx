import { Bell } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useBusinessSession } from "@/app/business-session"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function BusinessHeader() {
  const { state, error } = useBusinessSession()
  const { isMobile, openMobile } = useSidebar()
  const profile = state.profile
  return (
    <>
      <header className="sticky top-0 z-20 flex min-h-16 min-w-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur md:gap-3 md:px-6">
        <SidebarTrigger
          size="icon"
          className="size-11 shrink-0"
          aria-label={
            isMobile ? "Open business navigation" : "Toggle business navigation"
          }
          aria-expanded={isMobile ? openMobile : undefined}
        />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold"
            title={profile?.businessName}
          >
            {profile?.businessName ?? "Business portal"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
              />
            }
            aria-label="Notifications"
          >
            <Bell aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 max-w-[calc(100vw-2rem)]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              {state.alerts.length === 0 ? (
                <p className="px-2 py-2 text-sm text-muted-foreground">
                  No notifications yet
                </p>
              ) : (
                state.alerts.map((alert) => (
                  <DropdownMenuItem
                    key={alert.id}
                    render={<Link to="/business/inspections" />}
                    className="min-h-11 whitespace-normal"
                  >
                    {alert.title}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuItem
                render={<Link to="/business/inspections" />}
                className="min-h-11"
              >
                View inspections
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4 w-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
