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
import { BusinessAccountMenu } from "./business-account-menu"

const applicationRoutePrefixes = ["/business/fitness", "/business/fumigation"]

function isNavigationItemActive(pathname: string, href: string) {
  if (
    href === "/business/applications" &&
    applicationRoutePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return true
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function BusinessSidebar({ pathname }: { pathname: string }) {
  const { setOpenMobile, isMobile, state } = useSidebar()
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          to="/business/dashboard"
          aria-label="EHRCMS business home"
          onClick={() => setOpenMobile(false)}
          className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-ring"
        >
          <img
            src="/favicon/logo-green-48.svg"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            className="size-8 shrink-0 rounded-lg"
          />
          <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <strong className="block text-sm">EHRCMS</strong>
            <span className="text-xs text-muted-foreground">
              Business portal
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <nav aria-label="Business navigation">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {businessNavigation.map(({ label, href, icon: Icon }) => {
                  const active = isNavigationItemActive(pathname, href)
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
      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-2">
        <BusinessAccountMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
