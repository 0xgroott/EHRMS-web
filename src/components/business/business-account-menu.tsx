import { Link } from "@tanstack/react-router"
import { LogOut, Settings2 } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
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
import { useBusinessMedia } from "@/features/business-media/business-media-context"

export function BusinessAccountMenu() {
  const { state: session, signOut } = useBusinessSession()
  const { media } = useBusinessMedia()
  const { isMobile, state, setOpenMobile } = useSidebar()
  const profile = session.profile
  const initials = (profile?.businessName ?? "Business")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex min-h-16 w-full items-center gap-3 rounded-xl border bg-muted/40 p-3 text-left outline-none group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-0 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
        aria-label="Business account"
      >
        <Avatar className="size-10 group-data-[collapsible=icon]:size-8">
          {media.avatar && (
            <AvatarImage
              src={media.avatar.dataUrl}
              alt={`${profile?.businessName ?? "Business"} logo`}
            />
          )}
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 group-data-[collapsible=icon]:hidden">
          <strong className="block truncate text-sm font-semibold">
            {profile?.contactName || profile?.businessName || "Business"}
          </strong>
          <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
            Business account
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
            {profile?.contactName}
          </DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link to="/business/settings" />}
            onClick={() => setOpenMobile(false)}
            className="min-h-11"
          >
            <Settings2 aria-hidden="true" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ThemeMenuGroup />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              if (signOut()) window.location.assign("/")
            }}
            className="min-h-11"
          >
            <LogOut aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
