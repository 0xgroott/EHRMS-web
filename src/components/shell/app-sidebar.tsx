import { Link, useLocation } from "@tanstack/react-router"
import { LogOut } from "lucide-react"
import { visibleNavigation } from "@/domain/permissions"
import { useDemoSession } from "@/app/demo-session"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigation } from "./navigation"

export function AppSidebar() {
  const { role, roleLabel } = useDemoSession()
  const pathname = useLocation({ select: (location) => location.pathname })
  const allowed = visibleNavigation(role)
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary font-semibold text-primary-foreground">
            EH
          </span>
          <span className="leading-tight group-data-[collapsible=icon]:hidden">
            <strong className="block text-sm">EHRCMS</strong>
            <span className="text-xs text-muted-foreground">
              Public Health Operations
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation
                .filter(([id]) => allowed.includes(id))
                .map(([id, label, href, Icon]) => (
                  <SidebarMenuItem key={id}>
                    <Link
                      to={href}
                      className={`flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors ${pathname.startsWith(href) ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {label}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>AO</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">Ada Okafor</p>
            <p className="truncate text-xs text-muted-foreground">
              {roleLabel}
            </p>
          </div>
          <LogOut className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
