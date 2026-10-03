import { Link } from "@tanstack/react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { isMohNavigationItemActive, mohNavigation } from "./moh-navigation"

export function MohSidebar({ pathname }: { pathname: string }) {
  const { setOpenMobile, isMobile, state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          to="/moh/health-approvals"
          aria-label="EHRCMS MOH home"
          className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            EH
          </span>
          <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <strong className="block text-sm">EHRCMS</strong>
            <span className="text-xs text-muted-foreground">
              MOH / Director
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <nav aria-label="MOH navigation">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mohNavigation.map(({ label, href, icon: Icon }) => {
                  const active = isMohNavigationItemActive(pathname, href)
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        render={<Link to={href} />}
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        aria-label={label}
                        tooltip={
                          !isMobile && state === "collapsed" ? label : undefined
                        }
                        className="min-h-11 md:min-h-9"
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <p className="text-xs leading-5 text-muted-foreground">
          Clear decisions for safer businesses and communities.
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
