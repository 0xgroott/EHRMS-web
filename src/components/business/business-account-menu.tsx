import { Link } from "@tanstack/react-router"
import { Settings2 } from "lucide-react"
import { useBusinessSession } from "@/app/business-session"
import { SidebarAccountMenu } from "@/components/shared/sidebar-account-menu"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { useBusinessMedia } from "@/features/business-media/business-media-context"

export function BusinessAccountMenu() {
  const { state: session, signOut } = useBusinessSession()
  const { media } = useBusinessMedia()
  const { setOpenMobile } = useSidebar()
  const profile = session.profile
  const initials = (profile?.businessName ?? "Business")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
  return (
    <SidebarAccountMenu
      name={profile?.contactName || profile?.businessName || "Business"}
      label="Business account"
      initials={initials}
      avatar={media.avatar?.dataUrl}
      avatarAlt={`${profile?.businessName ?? "Business"} logo`}
      onSignOut={() => {
        if (signOut()) window.location.assign("/")
      }}
    >
      <DropdownMenuItem
        render={<Link to="/business/settings" />}
        onClick={() => setOpenMobile(false)}
        className="min-h-11"
      >
        <Settings2 aria-hidden="true" />
        Settings
      </DropdownMenuItem>
    </SidebarAccountMenu>
  )
}
