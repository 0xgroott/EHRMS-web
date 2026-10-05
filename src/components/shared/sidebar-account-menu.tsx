import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { ThemeMenuGroup } from "@/components/shared/theme-menu-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarAccountMenu({
  name,
  label,
  initials,
  avatar,
  avatarAlt,
  description,
  children,
  onSignOut,
}: {
  name: string
  label: string
  initials: string
  avatar?: string
  avatarAlt?: string
  description?: string
  children?: ReactNode
  onSignOut: () => void
}) {
  const { isMobile, state } = useSidebar()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex min-h-16 w-full items-center gap-3 rounded-xl border bg-muted/40 p-3 text-left outline-none group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
        aria-label={label}
      >
        <Avatar className="size-10 group-data-[collapsible=icon]:size-8">
          {avatar && <AvatarImage src={avatar} alt={avatarAlt ?? ""} />}
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 group-data-[collapsible=icon]:hidden">
          <strong className="block truncate text-sm font-semibold">
            {name}
          </strong>
          <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
            {label}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={!isMobile && state === "collapsed" ? "right" : "top"}
        align="start"
        className="w-60 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="break-words">
            {name}
            {description && (
              <span className="mt-0.5 block font-normal text-muted-foreground">
                {description}
              </span>
            )}
          </DropdownMenuLabel>
          {children}
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
