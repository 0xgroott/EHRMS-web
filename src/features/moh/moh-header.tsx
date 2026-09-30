import { LogOut } from "lucide-react"
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
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

function accountInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

export function MohHeader({
  title,
  accountName,
  councilName,
  onSignOut,
}: {
  title: string
  accountName: string
  councilName: string
  onSignOut: () => void
}) {
  const { isMobile, openMobile } = useSidebar()

  return (
    <header className="sticky top-0 z-20 flex min-h-16 min-w-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur md:gap-3 md:px-6">
      <SidebarTrigger
        size="icon"
        className="size-11 shrink-0"
        aria-label={isMobile ? "Open MOH navigation" : "Toggle MOH navigation"}
        aria-expanded={isMobile ? openMobile : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold" title={title}>
          {title}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-11 shrink-0" />
          }
          aria-label="MOH account"
        >
          <Avatar size="sm">
            <AvatarFallback>{accountInitials(accountName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 max-w-[calc(100vw-2rem)]"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="break-words">
              {accountName}
              <span className="mt-0.5 block font-normal text-muted-foreground">
                {councilName} Council
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSignOut} className="min-h-11">
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
