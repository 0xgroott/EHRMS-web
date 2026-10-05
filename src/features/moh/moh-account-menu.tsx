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
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { ThemeMenuGroup } from "@/components/shared/theme-menu-group"

function accountInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
}

export function MohAccountMenu({
  accountName,
  councilName,
  onSignOut,
  roleLabel = "MOH",
  sidebar = false,
}: {
  accountName: string
  councilName: string
  onSignOut: () => void
  roleLabel?: string
  sidebar?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          sidebar ? (
            <SidebarMenuButton
              size="lg"
              className="min-h-16 rounded-xl border bg-muted/40 p-3 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:p-0! hover:bg-muted"
            />
          ) : (
            <Button variant="ghost" size="icon" className="size-11 shrink-0" />
          )
        }
        aria-label={`${roleLabel} account`}
      >
        <Avatar
          size={sidebar ? "lg" : "sm"}
          className={
            sidebar ? "group-data-[collapsible=icon]:size-8" : undefined
          }
        >
          <AvatarFallback>{accountInitials(accountName)}</AvatarFallback>
        </Avatar>
        {sidebar && (
          <span className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
            <strong className="block truncate text-sm font-semibold">
              {accountName}
            </strong>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {roleLabel} / Director
            </span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={sidebar ? "top" : "bottom"}
        align={sidebar ? "start" : "end"}
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
        <ThemeMenuGroup />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onSignOut} className="min-h-11">
            <LogOut aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
