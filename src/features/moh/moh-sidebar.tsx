import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
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
import { mohNavigation } from "./moh-navigation"

export function MohSidebar({
  pathname,
  footerClassName = "p-3",
  accountMenu,
  items = mohNavigation,
  roleLabel = "MOH",
  workspaceLabel = "MOH / Director",
  homeHref = "/moh/health-approvals",
  footer = "Clear decisions for safer businesses and communities.",
}: {
  footerClassName?: string
  accountMenu?: ReactNode
  pathname: string
  items?: readonly { label: string; href: string; icon: LucideIcon }[]
  roleLabel?: string
  workspaceLabel?: string
  homeHref?: string
  footer?: string
}) {
  const { setOpenMobile, isMobile, state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Link
          to={homeHref}
          onClick={() => setOpenMobile(false)}
          aria-label={`EHRCMS ${roleLabel} home`}
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
              {workspaceLabel}
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <nav aria-label={`${roleLabel} navigation`}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ label, href, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`)
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
      <SidebarFooter className={footerClassName}>
        {accountMenu ? (
          <SidebarMenu>
            <SidebarMenuItem>{accountMenu}</SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <p className="text-xs leading-5 text-muted-foreground group-data-[collapsible=icon]:hidden">
            {footer}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
