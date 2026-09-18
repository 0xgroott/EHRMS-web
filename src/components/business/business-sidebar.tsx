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
import { businessNavigation } from "./business-navigation"

export function BusinessSidebar({ pathname }: { pathname: string }) {
  const { setOpenMobile, isMobile, state } = useSidebar()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <a
          href="/business/dashboard"
          aria-label="EHRCMS business home"
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
              Business portal
            </span>
          </span>
        </a>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <nav aria-label="Business navigation">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessNavigation.map(({ label, href, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`)
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        render={
                          href === "/business/dashboard" ? (
                            <a href={href} />
                          ) : (
                            <Link to={href} />
                          )
                        }
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
          Your business. One place for public health compliance.
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
